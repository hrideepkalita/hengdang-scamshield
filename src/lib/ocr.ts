/**
 * On-device OCR for screenshots of SMS / WhatsApp messages.
 * tesseract.js is loaded lazily so the first page view stays light.
 * The language model is fetched from the Tesseract CDN on first use.
 */

export type OcrProgress = (status: string, progress: number) => void;

export async function extractTextFromImage(
  file: File,
  onProgress?: OcrProgress,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (message) => {
      if (!message.status) return;
      onProgress?.(
        message.status === "recognizing text" ? "Reading the screenshot" : "Preparing the text engine",
        message.progress ?? 0,
      );
    },
  });

  try {
    const { data } = await worker.recognize(file);
    return (data.text ?? "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } finally {
    await worker.terminate();
  }
}
