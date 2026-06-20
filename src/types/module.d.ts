declare module 'gtts' {
  interface gTTSInstance {
    stream(): NodeJS.ReadableStream;
    save(file: string, callback: (err: Error | null, result?: unknown) => void): void;
  }
  interface gTTSConstructor {
    new (text: string, lang?: string, debug?: boolean): gTTSInstance;
  }
  const gTTS: gTTSConstructor;
  export default gTTS;
}
