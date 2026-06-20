import { PassThrough } from 'node:stream';

type TTSEngine = 'edge' | 'gtts';

interface TTSOptions {
  voice?: string;
}

async function edgeTTS(text: string, options?: TTSOptions): Promise<Buffer> {
  const { tts } = await import('edge-tts/out/index.js');

  return tts(text, {
    voice: options?.voice ?? 'en-KE-AsiliaNeural',
  }) as Promise<Buffer>;
}

function collectStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function gttsTTS(text: string): Promise<Buffer> {
  const gTTS = (await import('gtts')).default;
  const speech = new gTTS(text, 'en');
  const passThrough = new PassThrough();
  speech.stream().pipe(passThrough);
  return collectStream(passThrough);
}

export async function generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for speech generation');
  }

  const engines: { engine: TTSEngine; label: string }[] = [
    { engine: 'edge', label: 'Edge TTS' },
    { engine: 'gtts', label: 'gTTS' },
  ];

  const preferredEngine: TTSEngine = (process.env.TTS_PRIMARY_ENGINE as TTSEngine) || 'edge';

  const orderedEngines = preferredEngine === 'edge' ? engines : engines.reverse();

  for (const { engine, label } of orderedEngines) {
    try {
      if (engine === 'edge') {
        return await edgeTTS(text, options);
      } else {
        return await gttsTTS(text);
      }
    } catch (error) {
      console.warn(`${label} failed:`, error);
      continue;
    }
  }

  throw new Error('All TTS engines failed — unable to generate speech audio');
}
