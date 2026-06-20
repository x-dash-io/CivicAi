import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_CHUNK_SIZE = 4000;

const SYSTEM_PROMPT = `You are a plain-language government policy expert for Kenya.
Simplify the following policy document for a general Kenyan citizen.
Use short sentences. Avoid jargon. Be factual and neutral.
Output in 3 sections: Key Points (bullet list), What This Means for You, Next Steps.`;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env.local file.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function chunkText(text: string, maxTokens: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= maxTokens) {
      chunks.push(current.join(' '));
      current = [];
    }
  }
  if (current.length > 0) {
    chunks.push(current.join(' '));
  }
  return chunks;
}

export async function summarizeText(text: string): Promise<string> {
  if (!text || text.trim().length < 50) {
    throw new Error('Text is too short to summarize (minimum 50 characters required)');
  }

  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const chunks = chunkText(text, MAX_CHUNK_SIZE);
  const summaries: string[] = [];

  for (const chunk of chunks) {
    const result = await model.generateContent(chunk);
    const response = result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error('Gemini returned an empty response for a chunk');
    }

    summaries.push(summary);
  }

  if (summaries.length === 1) {
    return summaries[0];
  }

  const model2 = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are a plain-language government policy expert for Kenya.
Combine the following partial summaries of a policy document into one cohesive summary.
Output in 3 sections: Key Points (bullet list), What This Means for You, Next Steps.`,
  });

  const combinedResult = await model2.generateContent(summaries.join('\n\n---\n\n'));
  return combinedResult.response.text();
}
