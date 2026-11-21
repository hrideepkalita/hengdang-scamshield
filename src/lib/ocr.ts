/**
 * On-device OCR for screenshots of SMS / WhatsApp messages.
 * tesseract.js is loaded lazily so the first page view stays light, and the
 * worker (plus its ~4 MB language model) is reused across screenshots instead
 * of being downloaded and initialised again on every scan.
 */

export type OcrProgress = (status: string, progress: number) => void;

type OcrWorker = Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>>;

let workerPromise: Promise<OcrWorker> | null = null;
let progressSink: OcrProgress | undefined;

function getWorker(): Promise<OcrWorker> {
  if (!workerPromise) {
    workerPromise = import("tesseract.js")
      .then(({ createWorker }) =>
        createWorker("eng", 1, {
          logger: (message) => {
            if (!message.status) return;
            progressSink?.(
              message.status === "recognizing text"
                ? "Reading the screenshot"
                : "Preparing the text engine",
              message.progress ?? 0,
            );
          },
        }),
      )
      .catch((error) => {
        // Let the next attempt start from a clean worker.
        workerPromise = null;
        throw error;
      });
  }
  return workerPromise;
}

export async function extractTextFromImage(
  file: File,
  onProgress?: OcrProgress,
): Promise<string> {
  progressSink = onProgress;
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(file);
    return (data.text ?? "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (error) {
    // A failed recognition can leave the cached worker unusable.
    const stale = workerPromise;
    workerPromise = null;
    void stale?.then((worker) => worker.terminate()).catch(() => undefined);
    throw error;
  } finally {
    progressSink = undefined;
  }
}
