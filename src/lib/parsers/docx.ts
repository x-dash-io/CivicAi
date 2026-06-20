import mammoth from 'mammoth';

const MIN_TEXT_LENGTH = 50;

export class DOCXParseError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_TEXT' | 'PARSE_FAILED' | 'EMPTY_BUFFER'
  ) {
    super(message);
    this.name = 'DOCXParseError';
  }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new DOCXParseError('DOCX buffer is empty — no document data received', 'EMPTY_BUFFER');
  }

  let value: string;
  try {
    const result = await mammoth.extractRawText({ buffer });
    value = result.value?.trim() ?? '';
  } catch (error) {
    throw new DOCXParseError(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : 'unknown error'}`,
      'PARSE_FAILED'
    );
  }

  if (value.length < MIN_TEXT_LENGTH) {
    throw new DOCXParseError(
      `DOCX contains little or no extractable text (${value.length} chars). The file may be image-based or corrupted.`,
      'NO_TEXT'
    );
  }

  return value;
}
