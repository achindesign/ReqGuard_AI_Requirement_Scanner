import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, FilePlus, AlertCircle, Loader2 } from 'lucide-react';
import { AppLayout, PageHeader } from '@/components/AppLayout';
import { Card, Button, Select, Textarea, Input, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { isSupportedFileType, MAX_FILE_SIZE, extractTextFromTxt, extractTextFromPdf, extractTextFromDocx, getFileExtension } from '@/lib/textExtraction';
import { segmentRequirements } from '@/lib/requirementSegmentation';
import { trackEvent } from '@/lib/analytics';
import { invokeAnalysisFunction } from '@/lib/analysisFunction';
import { PLAN_LIMITS } from '@/types';

const DOC_TYPES = [
  { value: 'BRD', label: 'BRD — Business Requirements Document' },
  { value: 'PRD', label: 'PRD — Product Requirements Document' },
  { value: 'User Stories', label: 'User Stories' },
  { value: 'Functional Requirements', label: 'Functional Requirements' },
  { value: 'Other', label: 'Other' },
];

type UploadMode = 'file' | 'text';

export function NewAnalysisPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<UploadMode>('file');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('BRD');
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');

  const planLimits = PLAN_LIMITS[profile?.plan ?? 'free'];
  const analysesUsed = profile?.analyses_used ?? 0;
  const limitReached = analysesUsed >= planLimits.analyses;

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setError(null);

    if (!isSupportedFileType(selectedFile)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    if (!documentName) {
      setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleAnalyze = async () => {
    setError(null);

    // Validate inputs
    if (mode === 'file' && !file) {
      setError('Please select a file to upload.');
      return;
    }
    if (mode === 'text' && pastedText.trim().length < 20) {
      setError('Please paste at least 20 characters of requirement text.');
      return;
    }
    if (!documentName.trim()) {
      setError('Please enter a document name.');
      return;
    }

    // Check usage limits
    if (limitReached) {
      setError('You have reached your monthly analysis limit. Please upgrade your plan to continue.');
      trackEvent('paywall_reached');
      return;
    }

    setAnalyzing(true);
    setProgress('Preparing document...');

    try {
      let extractedText = '';
      let fileType = 'txt';
      let fileUrl: string | null = null;

      if (mode === 'file' && file) {
        const ext = getFileExtension(file.name);
        fileType = ext.replace('.', '');

        // Upload to storage
        setProgress('Uploading document...');
        const filePath = `${profile!.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw new Error('Failed to upload file. Please try again.');
        }

        fileUrl = filePath;

        // Extract text
        setProgress('Extracting text...');
        if (fileType === 'txt') {
          extractedText = await extractTextFromTxt(file);
        } else if (fileType === 'pdf') {
          extractedText = await extractTextFromPdf(file);
        } else {
          extractedText = await extractTextFromDocx(file);
        }

        if (extractedText.trim().length < 10) {
          throw new Error('Could not extract meaningful text from the document. It may be a scanned image or contain no readable text. Please paste the text directly.');
        }
      } else {
        extractedText = pastedText;
        fileType = 'txt';
      }

      // Segment requirements
      setProgress('Segmenting requirements...');
      const segments = segmentRequirements(extractedText);

      if (segments.length === 0) {
        throw new Error('No requirements could be identified in the document. Please ensure your document contains clearly stated requirements.');
      }

      // Check plan requirement limit
      if (segments.length > planLimits.requirements && planLimits.requirements !== 999999) {
        setError(`This document contains ${segments.length} requirements, but your plan allows up to ${planLimits.requirements}. Please upgrade to analyze this document.`);
        trackEvent('paywall_reached');
        setAnalyzing(false);
        return;
      }

      // Create document record
      setProgress('Saving document...');
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          filename: documentName,
          file_type: fileType,
          file_url: fileUrl,
          document_type: documentType,
          status: 'analyzing',
        })
        .select()
        .single();

      if (docError || !docData) {
        throw new Error('Failed to create document record.');
      }

      const documentId = docData.id;

      // Insert requirements
      setProgress('Saving requirements...');
      const reqRows = segments.map((s) => ({
        document_id: documentId,
        requirement_code: s.code,
        original_text: s.text,
        requirement_type: s.type,
        priority: s.priority,
      }));

      const { data: insertedReqs, error: reqError } = await supabase
        .from('requirements')
        .insert(reqRows)
        .select('id, requirement_code');

      if (reqError || !insertedReqs) {
        throw new Error('Failed to save requirements.');
      }

      // Call AI analysis edge function
      setProgress('Analyzing requirements with AI...');
      trackEvent('analysis_started');

      const analysisResult = await invokeAnalysisFunction({
        action: 'analyze',
        documentId,
        requirements: insertedReqs.map((r: { id: string; requirement_code: string }) => ({
          id: r.id,
          code: r.requirement_code,
          text: segments.find((s) => s.code === r.requirement_code)?.text ?? '',
        })),
      });

      if (analysisResult.success !== true) {
        throw new Error('AI analysis failed. Please try again.');
      }

      // Record usage
      await supabase.from('analysis_usage').insert({
        user_id: profile!.id,
        document_id: documentId,
        requirements_count: segments.length,
        tokens_used: typeof analysisResult.tokensUsed === 'number' ? analysisResult.tokensUsed : 0,
      });

      // Increment usage counter
      await supabase
        .from('profiles')
        .update({ analyses_used: analysesUsed + 1 })
        .eq('id', profile!.id);

      await refreshProfile();
      trackEvent('analysis_completed');

      setProgress('Done!');
      navigate(`/analysis/${documentId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setError(message);
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <AppLayout>
        <PageHeader title="New Analysis" subtitle="Your document is being analyzed." />
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Spinner size={48} />
            <p className="mt-6 text-lg font-medium text-gray-900">{progress}</p>
            <p className="mt-2 text-sm text-gray-500">This may take a minute. Please don't close this page.</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="New Analysis" subtitle="Upload a document or paste requirements for AI-powered analysis." />

      {limitReached && (
        <Card className="mb-6 border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">Monthly analysis limit reached</p>
              <p className="mt-1 text-sm text-orange-700">
                You've used all {planLimits.analyses} analyses on your {planLimits.label} plan.{' '}
                <button onClick={() => navigate('/pricing')} className="font-semibold underline">
                  Upgrade your plan
                </button>{' '}
                to continue.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('file');
              fileInputRef.current?.click();
            }}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'file' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload size={16} />
            Upload File
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'text' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} />
            Paste Text
          </button>
        </div>

        {/* File upload */}
        {mode === 'file' && (
          <Card className="p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${
                dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload size={32} className="text-gray-400" />
              <p className="mt-4 text-sm font-medium text-gray-900">
                {file ? file.name : 'Drop your file here or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOCX, or TXT · Max 10MB</p>
            </div>
          </Card>
        )}

        {/* Text paste */}
        {mode === 'text' && (
          <Card className="p-6">
            <Textarea
              label="Requirement text"
              value={pastedText}
              onChange={setPastedText}
              placeholder="Paste your requirements here. Example:&#10;&#10;1. The system shall allow users to register with email and password.&#10;2. The system shall process payments within 2 seconds.&#10;3. The system shall be fast and user-friendly."
              rows={10}
            />
          </Card>
        )}

        {/* Document metadata */}
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Document name"
              value={documentName}
              onChange={setDocumentName}
              placeholder="e.g. E-commerce Platform Requirements"
              required
            />
            <Select
              label="Document type"
              value={documentType}
              onChange={setDocumentType}
              options={DOC_TYPES}
            />
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleAnalyze} disabled={limitReached}>
            <FilePlus size={18} />
            Analyze Requirements
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
