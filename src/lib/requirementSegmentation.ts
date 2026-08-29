/**
 * Segments raw document text into individual requirements.
 * Uses heuristics: numbered lists, bullet points, "The system shall" patterns,
 * section headers, and sentence boundaries.
 */

export interface SegmentedRequirement {
  code: string;
  text: string;
  type: string;
  priority: string;
}

const REQUIREMENT_PATTERNS = [
  /^\s*(?:\d+[.\)]\s*|[-*•]\s*|REQ[-\s]?\d+[:.\s]\s*|FR[-\s]?\d+[:.\s]\s*|US[-\s]?\d+[:.\s]\s*)/i,
  /^\s*(?:The system shall|The system must|The system should|The application shall|Users shall|The user shall|As a .*, I want)/i,
];

const SECTION_PATTERNS = [
  /^\s*(?:\d+\.?\s+|Section\s+\d+)/i,
  /^\s*(?:Requirements?|Functional Requirements?|Non-Functional Requirements?|User Stories?|Business Rules?|Acceptance Criteria)\s*[:\-]/i,
];

export function segmentRequirements(rawText: string): SegmentedRequirement[] {
  const lines = rawText.split(/\r?\n/);
  const requirements: SegmentedRequirement[] = [];
  let currentSection = 'General';
  let buffer = '';
  let reqIndex = 0;

  const flushBuffer = () => {
    const trimmed = buffer.trim();
    if (trimmed.length > 10) {
      const isRequirement = REQUIREMENT_PATTERNS.some((p) => p.test(trimmed));
      if (isRequirement || trimmed.length > 20) {
        reqIndex++;
        const code = `REQ-${String(reqIndex).padStart(3, '0')}`;
        const type = detectRequirementType(trimmed);
        const priority = detectPriority(trimmed);
        requirements.push({ code, text: trimmed, type, priority });
      }
    }
    buffer = '';
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      flushBuffer();
      continue;
    }

    const isSection = SECTION_PATTERNS.some((p) => p.test(trimmedLine));
    if (isSection && trimmedLine.length < 80) {
      flushBuffer();
      currentSection = trimmedLine.replace(/[:\-].*$/, '').trim();
      continue;
    }

    const startsNewRequirement = REQUIREMENT_PATTERNS.some((p) => p.test(trimmedLine));
    if (startsNewRequirement && buffer.trim().length > 10) {
      flushBuffer();
    }

    buffer += (buffer ? ' ' : '') + trimmedLine;
  }

  flushBuffer();

  // If we couldn't segment well, split by sentences as fallback
  if (requirements.length === 0 && rawText.trim().length > 20) {
    const sentences = rawText
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    for (const sentence of sentences) {
      reqIndex++;
      const code = `REQ-${String(reqIndex).padStart(3, '0')}`;
      requirements.push({
        code,
        text: sentence,
        type: detectRequirementType(sentence),
        priority: detectPriority(sentence),
      });
    }
  }

  return requirements;
}

function detectRequirementType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('as a') && lower.includes('i want')) return 'user_story';
  if (lower.match(/performance|latency|response time|throughput|scalability/)) return 'non_functional';
  if (lower.match(/security|authentication|authorization|encryption|access control/)) return 'security';
  if (lower.match(/shall|must|should/)) return 'functional';
  return 'functional';
}

function detectPriority(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/\b(critical|essential|mandatory)\b/)) return 'critical';
  if (lower.match(/\b(high|important|must)\b/)) return 'high';
  if (lower.match(/\b(low|nice to have|optional)\b/)) return 'low';
  return 'medium';
}
