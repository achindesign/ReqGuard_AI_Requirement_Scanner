import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequirementInput {
  id: string;
  code: string;
  text: string;
}

interface RequirementAnalysis {
  id: string;
  code: string;
  clarity_score: number;
  completeness_score: number;
  testability_score: number;
  consistency_score: number;
  measurability_score: number;
  overall_score: number;
  findings: Array<{
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    issue: string;
    explanation: string;
    recommendation: string;
  }>;
}

const SCORE_WEIGHTS = {
  clarity: 0.15,
  completeness: 0.15,
  testability: 0.15,
  consistency: 0.10,
  measurability: 0.10,
  business_rules: 0.15,
  exception_handling: 0.10,
  acceptance_criteria: 0.10,
};

function calculateOverallScore(scores: {
  clarity: number;
  completeness: number;
  testability: number;
  consistency: number;
  measurability: number;
  business_rules: number;
  exception_handling: number;
  acceptance_criteria: number;
}): number {
  return Math.round(
    scores.clarity * SCORE_WEIGHTS.clarity +
    scores.completeness * SCORE_WEIGHTS.completeness +
    scores.testability * SCORE_WEIGHTS.testability +
    scores.consistency * SCORE_WEIGHTS.consistency +
    scores.measurability * SCORE_WEIGHTS.measurability +
    scores.business_rules * SCORE_WEIGHTS.business_rules +
    scores.exception_handling * SCORE_WEIGHTS.exception_handling +
    scores.acceptance_criteria * SCORE_WEIGHTS.acceptance_criteria
  );
}

function analyzeRequirementHeuristic(req: RequirementInput): RequirementAnalysis {
  const text = req.text;
  const lower = text.toLowerCase();

  const vagueWords = ["fast", "user-friendly", "intuitive", "robust", "scalable", "efficient", "good", "nice", "simple", "easy", "quick", "responsive", "modern", "flexible"];
  const vagueCount = vagueWords.filter((w) => lower.includes(w)).length;
  const hasSpecificNumbers = /\d+/.test(text);
  const hasMeasurableCriteria = lower.match(/seconds?|ms|mb|gb|kb|percent|%|users? per|requests? per|within \d/);
  const hasConditionalLogic = lower.match(/if|when|unless|except|otherwise|in case of/);
  const hasExceptionHandling = lower.match(/error|fail|invalid|exception|timeout|retry|fallback/);
  const hasAcceptanceCriteria = text.match(/shall|must|should/i) && text.length > 30;
  const wordCount = text.split(/\s+/).length;

  const clarity_score = Math.max(20, 100 - vagueCount * 15 - (wordCount < 8 ? 20 : 0));
  const completeness_score = Math.max(20, 100 - (hasSpecificNumbers ? 0 : 25) - (hasConditionalLogic ? 0 : 20));
  const testability_score = Math.max(15, 100 - (hasMeasurableCriteria ? 0 : 35) - (vagueCount * 10));
  const consistency_score = Math.max(40, 100 - vagueCount * 5);
  const measurability_score = Math.max(15, 100 - (hasMeasurableCriteria ? 0 : 40) - (hasSpecificNumbers ? 0 : 15));
  const business_rules = Math.max(20, 100 - (hasConditionalLogic ? 0 : 30) - (wordCount < 15 ? 15 : 0));
  const exception_handling = Math.max(10, 100 - (hasExceptionHandling ? 0 : 45));
  const acceptance_criteria = Math.max(15, 100 - (hasAcceptanceCriteria ? 0 : 35) - (wordCount < 20 ? 15 : 0));

  const overall_score = calculateOverallScore({
    clarity: clarity_score,
    completeness: completeness_score,
    testability: testability_score,
    consistency: consistency_score,
    measurability: measurability_score,
    business_rules,
    exception_handling,
    acceptance_criteria,
  });

  const findings: RequirementAnalysis["findings"] = [];

  if (vagueCount > 0) {
    const words = vagueWords.filter((w) => lower.includes(w));
    findings.push({
      category: "Ambiguity",
      severity: vagueCount >= 2 ? "high" : "medium",
      issue: `Vague or subjective term(s): "${words.join(", ")}"`,
      explanation: `The requirement uses subjective language that cannot be objectively measured or tested. Terms like "${words[0]}" mean different things to different stakeholders.`,
      recommendation: `Replace "${words[0]}" with a specific, measurable criterion. For example, instead of "fast loading", use "page loads within 2 seconds".`,
    });
  }

  if (!hasMeasurableCriteria) {
    findings.push({
      category: "Testability",
      severity: "high",
      issue: "No measurable acceptance criteria",
      explanation: "The requirement does not include any quantifiable or testable criteria, making it impossible to verify whether the requirement has been met.",
      recommendation: "Add specific, measurable thresholds (e.g., response time, quantity, percentage) that can be objectively tested.",
    });
  }

  if (!hasConditionalLogic) {
    findings.push({
      category: "Missing Business Rules",
      severity: "medium",
      issue: "No conditional logic or business rules specified",
      explanation: "The requirement does not describe what should happen under different conditions or scenarios, leaving important behavior unspecified.",
      recommendation: "Define the conditions under which this requirement applies and what should happen in each case (e.g., 'If the user is not authenticated, redirect to login').",
    });
  }

  if (!hasExceptionHandling) {
    findings.push({
      category: "Exception Handling",
      severity: "medium",
      issue: "No exception or error handling defined",
      explanation: "The requirement does not address what happens when things go wrong (errors, failures, invalid input), which can lead to undefined system behavior.",
      recommendation: "Specify error handling behavior: what errors might occur, how the system should respond, and what the user should see.",
    });
  }

  if (!hasAcceptanceCriteria) {
    findings.push({
      category: "Acceptance Criteria",
      severity: "medium",
      issue: "Missing acceptance criteria",
      explanation: "The requirement lacks clear acceptance criteria that define when it is considered complete and correctly implemented.",
      recommendation: "Add explicit acceptance criteria in the form of testable statements (e.g., 'Given X, when Y, then Z').",
    });
  }

  if (wordCount < 10) {
    findings.push({
      category: "Completeness",
      severity: "high",
      issue: "Requirement is too brief",
      explanation: "The requirement is very short and likely missing important context, constraints, or details needed for implementation.",
      recommendation: "Expand the requirement with more context, including who, what, when, where, and why.",
    });
  }

  return {
    id: req.id,
    code: req.code,
    clarity_score,
    completeness_score,
    testability_score,
    consistency_score,
    measurability_score,
    overall_score,
    findings,
  };
}

function detectContradictions(
  requirements: RequirementInput[],
  _analyses: RequirementAnalysis[]
): Array<{ req1_code: string; req2_code: string; issue: string; recommendation: string }> {
  const contradictions: Array<{ req1_code: string; req2_code: string; issue: string; recommendation: string }> = [];

  for (let i = 0; i < requirements.length; i++) {
    for (let j = i + 1; j < requirements.length; j++) {
      const r1 = requirements[i];
      const r2 = requirements[j];
      const t1 = r1.text.toLowerCase();
      const t2 = r2.text.toLowerCase();

      if (t1.includes("password") && t2.includes("password")) {
        const len1 = t1.match(/(\d+)\s*char/);
        const len2 = t2.match(/(\d+)\s*char/);
        if (len1 && len2 && len1[1] !== len2[1]) {
          contradictions.push({
            req1_code: r1.code,
            req2_code: r2.code,
            issue: `Contradictory password length requirements: ${r1.code} specifies ${len1[1]} characters, ${r2.code} specifies ${len2[1]} characters.`,
            recommendation: "Align both requirements to use the same password length constraint.",
          });
        }
      }

      const mustPattern = /shall|must/i;
      const mustNotPattern = /shall not|must not|should not/i;
      if (mustPattern.test(r1.text) && mustNotPattern.test(r2.text)) {
        const words1 = new Set(t1.split(/\s+/).filter((w) => w.length > 4));
        const words2 = new Set(t2.split(/\s+/).filter((w) => w.length > 4));
        const common = [...words1].filter((w) => words2.has(w));
        if (common.length >= 3) {
          contradictions.push({
            req1_code: r1.code,
            req2_code: r2.code,
            issue: `Potential contradiction: ${r1.code} requires an action while ${r2.code} prohibits a similar action.`,
            recommendation: "Review both requirements to ensure they do not conflict. Clarify the conditions under which each applies.",
          });
        }
      }
    }
  }

  return contradictions;
}

// --- PDF text extraction (no external dependencies) ---

async function decompressFlateDecode(data: Uint8Array): Promise<Uint8Array> {
  // Deno has DecompressionStream built in. Raw deflate needs a zlib wrapper,
  // so we use "deflate" format (zlib header + deflate).
  const blob = new Blob([data]);
  const ds = new DecompressionStream("deflate");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const decompressed = await new Response(decompressedStream).arrayBuffer();
  return new Uint8Array(decompressed);
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let fullText = "";

  // Scan for stream objects. PDF streams look like:
  //   ... stream\n<bytes>\nendstream
  // We look for "stream" keyword, read until "endstream", and try to decode.
  // For FlateDecode streams, we attempt decompression.

  const streamKeyword = new TextEncoder().encode("stream");
  const endstreamKeyword = new TextEncoder().encode("endstream");

  let i = 0;
  while (i < bytes.length - 6) {
    // Find "stream" keyword
    if (matchBytes(bytes, i, streamKeyword)) {
      // Skip "stream" (6 bytes) and following whitespace (CR, LF, or CRLF)
      let start = i + 6;
      if (bytes[start] === 0x0d) start++; // CR
      if (bytes[start] === 0x0a) start++; // LF

      // Find "endstream"
      let end = -1;
      for (let j = start; j < bytes.length - 9; j++) {
        if (matchBytes(bytes, j, endstreamKeyword)) {
          // Walk back past whitespace
          end = j;
          break;
        }
      }
      if (end === -1) break;

      let dataEnd = end;
      if (bytes[dataEnd - 1] === 0x0a) dataEnd--; // LF before endstream
      if (bytes[dataEnd - 1] === 0x0d) dataEnd--; // CR before endstream

      const streamData = bytes.subarray(start, dataEnd);

      // Try raw decode first
      const rawText = decoder.decode(streamData);
      const hasTextOperators = /\b(Tj|TJ|BT|ET|Td|TD|Tm|T\*)\b/.test(rawText);

      if (hasTextOperators) {
        // Extract text from Tj and TJ operators
        fullText += extractTextFromPdfContentStream(rawText) + "\n";
      } else {
        // Try FlateDecode decompression
        try {
          const decompressed = await decompressFlateDecode(streamData);
          const decompressedText = decoder.decode(decompressed);
          if (/\b(Tj|TJ|BT|ET|Td|TD|Tm|T\*)\b/.test(decompressedText)) {
            fullText += extractTextFromPdfContentStream(decompressedText) + "\n";
          }
        } catch {
          // Not a deflate stream or decompression failed — skip
        }
      }

      i = end + 9; // Skip past "endstream"
    } else {
      i++;
    }
  }

  return fullText.trim();
}

function matchBytes(data: Uint8Array, offset: number, pattern: Uint8Array): boolean {
  if (offset + pattern.length > data.length) return false;
  for (let k = 0; k < pattern.length; k++) {
    if (data[offset + k] !== pattern[k]) return false;
  }
  return true;
}

function extractTextFromPdfContentStream(content: string): string {
  let text = "";

  // Match text in parentheses: (text) Tj  or  [(text1) -100 (text2)] TJ
  // Also handle escaped characters inside parentheses
  const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(content)) !== null) {
    text += unescapePdfString(match[1]);
  }

  // TJ arrays: [(text1) -100 (text2)] TJ
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const textParts = inner.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g);
    if (textParts) {
      for (const part of textParts) {
        text += unescapePdfString(part.slice(1, -1));
      }
    }
    text += " ";
  }

  // Add newlines for line breaks (Td/TD operators roughly indicate new lines)
  text = text.replace(/\n{3,}/g, "\n\n");
  return text;
}

function unescapePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\((\()/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

// --- DOCX text extraction (ZIP parsing with Deno built-in decompression) ---

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let offset = 0;
  let documentXml: Uint8Array | null = null;
  let compressionMethod = 0;

  // Parse ZIP local file headers (signature 0x04034b50)
  while (offset < bytes.length - 4) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;

    compressionMethod = view.getUint16(offset + 6, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const filenameLen = view.getUint16(offset + 22, true);
    const extraLen = view.getUint16(offset + 24, true);
    const filename = new TextDecoder().decode(
      bytes.subarray(offset + 30, offset + 30 + filenameLen)
    );

    const dataOffset = offset + 30 + filenameLen + extraLen;

    if (filename === "word/document.xml") {
      documentXml = bytes.subarray(dataOffset, dataOffset + compressedSize);
      break;
    }

    offset = dataOffset + compressedSize;
  }

  if (!documentXml) {
    throw new Error("word/document.xml not found");
  }

  let xmlString: string;
  if (compressionMethod === 0) {
    xmlString = new TextDecoder().decode(documentXml);
  } else if (compressionMethod === 8) {
    // Deflate — wrap in zlib format for DecompressionStream("deflate")
    const decompressed = await decompressFlateDecode(documentXml);
    xmlString = new TextDecoder().decode(decompressed);
  } else {
    throw new Error(`Unsupported compression: ${compressionMethod}`);
  }

  // Extract text from <w:t> tags, adding newlines for paragraph breaks
  const text = xmlString
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

// --- Rewriting helpers ---

function rewriteRequirement(original: string): { text: string; assumptions: string; edge_cases: string } {
  const lower = original.toLowerCase();
  let rewritten = original;

  const replacements: Array<[RegExp, string]> = [
    [/\bfast\b/gi, "within 2 seconds"],
    [/\bquick(?:ly)?\b/gi, "within 1 second"],
    [/\buser-friendly\b/gi, "completable in 3 or fewer steps"],
    [/\bintuitive\b/gi, "requiring no prior training"],
    [/\brobust\b/gi, "handling up to 10,000 concurrent users"],
    [/\bscalable\b/gi, "supporting up to 100,000 users"],
    [/\befficient\b/gi, "completing within 500ms"],
    [/\bsimple\b/gi, "completable in 2 steps"],
    [/\beasy\b/gi, "completable without documentation"],
    [/\bresponsive\b/gi, "rendering within 1 second on mobile and desktop"],
    [/\bmodern\b/gi, "following current WCAG accessibility standards"],
    [/\bflexible\b/gi, "configurable via admin settings"],
  ];

  for (const [pattern, replacement] of replacements) {
    rewritten = rewritten.replace(pattern, replacement);
  }

  if (!/\d/.test(rewritten)) {
    rewritten += " The system shall complete this operation within 3 seconds under normal load (up to 1,000 concurrent users).";
  }

  if (!lower.match(/error|fail|invalid|exception/)) {
    rewritten += " If the operation fails, the system shall display a user-friendly error message and log the error for debugging.";
  }

  rewritten += " Acceptance: verified via automated test confirming the operation completes within the specified time and error states are handled gracefully.";

  const assumptions = [
    "Normal load is defined as up to 1,000 concurrent users.",
    "Error messages are displayed in the user's selected language.",
    "All errors are logged with sufficient context for debugging.",
  ];

  const edge_cases = [
    "What happens if the user is not authenticated?",
    "What happens if the system is under heavy load (10,000+ concurrent users)?",
    "What happens if the underlying service is temporarily unavailable?",
    "What happens if the user's session expires during the operation?",
  ];

  return { text: rewritten, assumptions: assumptions.join("\n"), edge_cases: edge_cases.join("\n") };
}

function generateAcceptanceCriteria(_original: string): string {
  const criteria: string[] = [];

  criteria.push("Given the user has appropriate permissions,");
  criteria.push("When the user initiates the described action,");
  criteria.push("Then the system shall complete the operation successfully within the specified time frame.");

  criteria.push("");
  criteria.push("Given the system is under normal load conditions,");
  criteria.push("When the user performs the action,");
  criteria.push("Then the system shall respond within 3 seconds.");

  criteria.push("");
  criteria.push("Given an error occurs during the operation,");
  criteria.push("When the system encounters an error,");
  criteria.push("Then the system shall display a user-friendly error message and log the error details.");

  criteria.push("");
  criteria.push("Given the user provides invalid input,");
  criteria.push("When the user submits the invalid input,");
  criteria.push("Then the system shall reject the input and display validation errors.");

  criteria.push("");
  criteria.push("Given the operation is completed successfully,");
  criteria.push("When the user verifies the result,");
  criteria.push("Then the system shall reflect the expected state change.");

  return criteria.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "extract") {
      const { filePath, fileType } = body;

      if (!filePath) {
        return new Response(
          JSON.stringify({ error: "Missing file path." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("documents")
        .download(filePath);

      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({ error: "Failed to download file from storage." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuffer = await fileData.arrayBuffer();

      if (fileType === "pdf") {
        try {
          const text = await extractPdfText(arrayBuffer);
          if (text.length < 10) {
            return new Response(
              JSON.stringify({ error: "The PDF appears to contain no extractable text. It may be a scanned image. Please paste the text directly." }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ text }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to extract text from PDF. The file may be corrupted or scanned. Please try pasting text directly." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (fileType === "docx") {
        try {
          const text = await extractDocxText(arrayBuffer);
          if (text.length < 10) {
            return new Response(
              JSON.stringify({ error: "The DOCX appears to contain no extractable text. Please try pasting text directly." }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ text }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch {
          return new Response(
            JSON.stringify({ error: "Failed to extract text from DOCX. Please try pasting text directly." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Unsupported file type for extraction." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "analyze") {
      const { documentId, requirements } = body as {
        documentId: string;
        requirements: RequirementInput[];
      };

      if (!documentId || !requirements || !Array.isArray(requirements)) {
        return new Response(
          JSON.stringify({ error: "Missing documentId or requirements." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const analyses: RequirementAnalysis[] = requirements.map((req) =>
        analyzeRequirementHeuristic(req)
      );

      const contradictions = detectContradictions(requirements, analyses);

      for (const analysis of analyses) {
        await supabase
          .from("requirements")
          .update({
            clarity_score: analysis.clarity_score,
            completeness_score: analysis.completeness_score,
            testability_score: analysis.testability_score,
            consistency_score: analysis.consistency_score,
            measurability_score: analysis.measurability_score,
            overall_score: analysis.overall_score,
          })
          .eq("id", analysis.id);

        if (analysis.findings.length > 0) {
          const findingRows = analysis.findings.map((f) => ({
            requirement_id: analysis.id,
            category: f.category,
            severity: f.severity,
            issue: f.issue,
            explanation: f.explanation,
            recommendation: f.recommendation,
          }));
          await supabase.from("findings").insert(findingRows);
        }
      }

      for (const c of contradictions) {
        const req1 = requirements.find((r) => r.code === c.req1_code);
        const req2 = requirements.find((r) => r.code === c.req2_code);
        if (req1) {
          await supabase.from("findings").insert({
            requirement_id: req1.id,
            category: "Contradiction",
            severity: "high",
            issue: c.issue,
            explanation: `This requirement may conflict with ${c.req2_code}.`,
            recommendation: c.recommendation,
          });
        }
        if (req2) {
          await supabase.from("findings").insert({
            requirement_id: req2.id,
            category: "Contradiction",
            severity: "high",
            issue: c.issue,
            explanation: `This requirement may conflict with ${c.req1_code}.`,
            recommendation: c.recommendation,
          });
        }
      }

      const overallScore = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length)
        : 0;

      await supabase
        .from("documents")
        .update({
          status: "completed",
          overall_score: overallScore,
        })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({
          success: true,
          overallScore,
          requirementsAnalyzed: analyses.length,
          findingsCount: analyses.reduce((sum, a) => sum + a.findings.length, 0) + contradictions.length * 2,
          contradictionsCount: contradictions.length,
          tokensUsed: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rewrite") {
      const { requirementId, originalText } = body;
      const rewritten = rewriteRequirement(originalText);

      const { data: improvement } = await supabase
        .from("improvements")
        .insert({
          requirement_id: requirementId,
          rewritten_requirement: rewritten.text,
          assumptions: rewritten.assumptions,
          edge_cases: rewritten.edge_cases,
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ success: true, improvement }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "acceptance-criteria") {
      const { requirementId, originalText } = body;
      const criteria = generateAcceptanceCriteria(originalText);

      const { data: existing } = await supabase
        .from("improvements")
        .select("id")
        .eq("requirement_id", requirementId)
        .maybeSingle();

      let improvement;
      if (existing) {
        const { data: updated } = await supabase
          .from("improvements")
          .update({ acceptance_criteria: criteria })
          .eq("id", existing.id)
          .select()
          .single();
        improvement = updated;
      } else {
        const { data: inserted } = await supabase
          .from("improvements")
          .insert({
            requirement_id: requirementId,
            acceptance_criteria: criteria,
          })
          .select()
          .single();
        improvement = inserted;
      }

      return new Response(
        JSON.stringify({ success: true, improvement }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: "Analysis failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
