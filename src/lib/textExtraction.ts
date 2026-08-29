/**
 * Extracts plain text from uploaded files in the browser.
 */

import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
  });
  const document = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
    }
  } finally {
    await document.destroy();
  }

  return pages.join('\n').trim();
}

export async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

export function extractTextFromTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Unable to read text file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function isSupportedFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
  return allowedTypes.includes(file.type) || hasValidExtension;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}
