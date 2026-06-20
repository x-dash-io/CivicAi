import { PDFParse } from 'pdf-parse';

const MIN_TEXT_LENGTH = 50;

export class PDFParseError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_TEXT' | 'PARSE_FAILED' | 'EMPTY_BUFFER'
  ) {
    super(message);
    this.name = 'PDFParseError';
  }
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new PDFParseError('PDF buffer is empty — no document data received', 'EMPTY_BUFFER');
  }

  let result: { text: string };
  try {
    const parser = new PDFParse({ data: buffer });
    result = await parser.getText();
  } catch (error) {
    throw new PDFParseError(
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'unknown error'}`,
      'PARSE_FAILED'
    );
  }

  const text = (result.text ?? '').trim();

  if (text.length < MIN_TEXT_LENGTH) {
    throw new PDFParseError(
      `PDF contains little or no extractable text (${text.length} chars). This is common with scanned/image-based PDFs. Upload a text-based PDF or OCR-processed document instead.`,
      'NO_TEXT'
    );
  }

  return text;
}
