import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  ChevronRight,
  ExternalLink,
  History,
  ImageUp,
  Link2,
  Lock,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useThreatData } from "../lib/data";
import { analyzeUrl, decodeImageData, decodeQrFromFile, type UrlAnalysis, type Verdict } from "../lib/scan";
import { Badge, Panel } from "../components/ui";
import { QRHeroArt } from "../components/Illustrations";
import { useI18n, type StringKey } from "../lib/i18n";
import { timeAgo } from "../lib/format";

const verdictMeta: Record<
  Verdict,
  { labelKey: StringKey; color: string; tone: "red" | "amber" | "green" }
> = {
  dangerous: { labelKey: "qr.dangerous", color: "#ef4444", tone: "red" },
  suspicious: { labelKey: "qr.suspicious", color: "#f59e0b", tone: "amber" },
  safe: { labelKey: "qr.safe", color: "#34d399", tone: "green" },
};

function ShieldEmblem({ verdict }: { verdict: Verdict }) {
  const ribbon = verdict === "dangerous" ? "#dc2626" : verdict === "suspicious" ? "#d97706" : "#059669";
  const ribbonDark = verdict === "dangerous" ? "#991b1b" : verdict === "suspicious" ? "#92400e" : "#065f46";
  const shield = "#0f766e";
  return (
    <svg viewBox="0 0 200 178" className="h-[150px] w-[170px]" aria-hidden>
      <defs>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="55%" stopColor={shield} />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="ribbonFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ribbon} />
          <stop offset="100%" stopColor={ribbonDark} />
        </linearGradient>
        <filter id="emblemShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter="url(#emblemShadow)">
        <path
          d="M100 8 L174 34 V90 C174 131 142 160 100 172 C58 160 26 131 26 90 V34 Z"
          fill="url(#shieldFill)"
          stroke="#0b3b33"
          strokeWidth="2"
        />
        <path
          d="M100 24 L156 44 V90 C156 123 131 146 100 156 C69 146 44 123 44 90 V44 Z"
          fill="#0d9488"
          fillOpacity="0.28"
          stroke="#5eead4"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <path d="M100 44 L128 68 v20 c0 16-12 28-28 34 -16-6-28-18-28-34 V68 Z" fill="#042f2e" fillOpacity="0.55" />
        <path
          d="M8 60 H192 L178 92 L192 124 H8 L22 92 Z"
          fill="url(#ribbonFill)"
          stroke={ribbonDark}
          strokeWidth="2"
        />
        {[58, 100, 142].map((x) => (
          <path
            key={x}
            d={`M${x} 74 L${x - 9} 93 L${x - 1} 93 L${x - 7} 110 L${x + 11} 86 L${x + 2} 86 L${x + 8} 74 Z`}
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="0.5"
          />
        ))}
        {verdict === "safe" && (
          <path
            d="M84 145 l11 11 22-24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
    </svg>
  );
}

export default function Scanner() {
  const { t } = useI18n();
  const { data, recordScan, scans } = useThreatData();
  const [tab, setTab] = useState<"camera" | "upload">("camera");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "on" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysis | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const lastScanAtRef = useRef(0);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePayload = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const analysis = analyzeUrl(text);
      setPayload(text);
      setResult(analysis);
      recordScan({
        url: analysis.url,
        verdict: analysis.verdict,
        reason: analysis.reason,
        score: analysis.score,
      });
    },
    [recordScan],
  );

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    lastScanAtRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  }, []);

  const tick = useCallback(() => {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      // Decoding on every animation frame pins a phone CPU. Roughly eight
      // frames per second is more than enough for a static QR code.
      const now = performance.now();
      if (now - lastScanAtRef.current >= 120) {
        lastScanAtRef.current = now;
        const ctx =
          canvasCtxRef.current ??
          (canvasCtxRef.current = canvas.getContext("2d", { willReadFrequently: true }));
        if (ctx) {
          const maxSide = 640;
          const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decoded = decodeImageData(frame);
          if (decoded) {
            stopCamera();
            handlePayload(decoded);
            return;
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [handlePayload, stopCamera]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setError(t("qr.errCamera"));
      return;
    }
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      // The user may have switched tabs while the permission prompt was open.
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraState("idle");
        return;
      }
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraState("on");
      scanningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraState("error");
      setError(t("qr.errStart"));
    }
  }, [t, tick]);

  // Leaving the camera tab unmounts the <video>; stop the stream so the camera
  // is not left running in the background.
  useEffect(() => {
    if (tab === "camera") return;
    stopCamera();
  }, [stopCamera, tab]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const onFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const decoded = await decodeQrFromFile(file);
      if (!decoded) {
        setError(
          t("qr.errNoQr"),
        );
      } else {
        handlePayload(decoded);
      }
    } catch {
      setError(t("qr.errImage"));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPayload(null);
    setError(null);
    if (cameraState === "on") stopCamera();
  };

  const meta = result ? verdictMeta[result.verdict] : null;

  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-2xl pb-2 pt-1 text-center">
        <QRHeroArt className="hero-float mx-auto h-[96px] w-auto sm:h-[124px]" />
        <h1 className="mt-2 font-display text-[28px] font-extrabold leading-tight tracking-tight text-[#0b1220] sm:text-[38px]">
          {t("qr.heroA")}<span className="text-[#2563eb]">{t("qr.heroB")}</span>{t("qr.heroC")}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[14px] font-medium leading-relaxed text-[#5b6b8c] sm:text-[15px]">
          {t("qr.sub")}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge tone="green" dot>
            {t("qr.badge1")}
          </Badge>
          <Badge tone="sky">{t("qr.badge2")}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* Scanner */}
        <div className="xl:col-span-5">
          <Panel
            title={t("qr.scannerTitle")}
            subtitle={t("qr.scannerSub")}
            action={
              <div className="seg">
                <button
                  type="button"
                  data-active={tab === "camera"}
                  onClick={() => setTab("camera")}
                >
                  <span className="flex items-center gap-1">
                    <Camera size={10} /> {t("qr.camera")}
                  </span>
                </button>
                <button
                  type="button"
                  data-active={tab === "upload"}
                  onClick={() => setTab("upload")}
                >
                  <span className="flex items-center gap-1">
                    <ImageUp size={10} /> {t("qr.upload")}
                  </span>
                </button>
              </div>
            }
          >
            <div className="p-3">
              <div className="relative overflow-hidden rounded-xl border border-[#dbe4f6] bg-[#f7faff]">
                {tab === "camera" ? (
                  <div className="relative aspect-[4/3] w-full">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`h-full w-full object-cover transition ${
                        cameraState === "on" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {cameraState !== "on" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,#eaf2ff,#ffffff)] text-center">
                        <img
                          src="/brand/hengdang-emblem.webp"
                          alt=""
                          className="h-32 w-32 rounded-full object-cover opacity-30 sm:h-40 sm:w-40"
                        />
                        {cameraState === "starting" && (
                          <p className="text-[12.5px] font-semibold text-[#7183a8]">
                            {t("qr.requesting")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* scanner frame */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#2563eb]" />
                        <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#2563eb]" />
                        <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#2563eb]" />
                        <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#2563eb]" />
                        {cameraState === "on" && (
                          <span className="scan-line absolute left-1 right-1 h-px bg-gradient-to-r from-transparent via-[#2563eb] to-transparent shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
                        )}
                      </div>
                    </div>

                    {cameraState === "on" && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-[#0b1b3f]/70 px-2 py-1 text-[11px] text-[#15803d] backdrop-blur">
                        <span className="live-dot" /> Scanning
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,#eaf2ff,#ffffff)] p-4 text-center">
                    <img
                      src="/brand/hengdang-emblem.webp"
                      alt=""
                      className="h-24 w-24 rounded-full object-cover opacity-30"
                    />
                    <p className="text-[13.5px] font-semibold text-[#334155]">
                      {t("qr.uploadTitle")}
                    </p>
                    <p className="max-w-[260px] text-[12px] leading-relaxed text-[#93a2bf]">
                      {t("qr.uploadBody")}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 rounded-md border border-[#c9d8ef] bg-[#e8effd] px-3 py-1.5 text-[12px] font-medium text-[#2563eb] transition hover:bg-[#2563eb]/20"
                    >
                      {busy ? t("qr.decoding") : t("qr.chooseImage")}
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {cameraState === "on" ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 rounded-md border border-[#dbe4f6] px-2.5 py-1.5 text-[12px] text-[#334155] transition hover:border-[#ef4444] hover:text-[#dc2626]"
                  >
                    <CameraOff size={12} /> {t("qr.stopCamera")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraState === "starting"}
                    className="flex items-center gap-1.5 rounded-md border border-[#c9d8ef] bg-[#e8effd] px-2.5 py-1.5 text-[12px] font-medium text-[#2563eb] transition hover:bg-[#2563eb]/20 disabled:opacity-50"
                  >
                    <Camera size={12} /> {t("qr.startCamera")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTab("upload");
                    setTimeout(() => fileInputRef.current?.click(), 0);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-[#dbe4f6] px-2.5 py-1.5 text-[12px] text-[#334155] transition hover:text-[#2563eb]"
                >
                  <ImageUp size={12} /> {t("qr.uploadQr")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePayload("http://secure-kyc-verify-bank.top/login?session=refund");
                    setTab("camera");
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-[#dbe4f6] px-2.5 py-1.5 text-[12px] text-[#334155] transition hover:text-[#b45309]"
                  title="Runs a local sample analysis"
                >
                  <Sparkles size={12} /> {t("qr.sample")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    // Reset so choosing the same file again still fires a change.
                    e.target.value = "";
                    void onFile(file);
                  }}
                />
              </div>

              {error && (
                <p className="mt-2 flex items-start gap-1.5 rounded-md border border-[#f6d3a7] bg-[#fff8ee] px-2.5 py-2 text-[11px] leading-relaxed text-[#8a4b12]">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <div className="mt-3 border-t border-[#eef2fb] pt-2.5">
                <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[#7183a8]">
                  <Link2 size={11} /> {t("qr.inspectLabel")}
                </label>
                <form
                  className="mt-1.5 flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manual.trim()) handlePayload(manual.trim());
                  }}
                >
                  <input
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="https://example.com/login"
                    className="min-w-0 flex-1 rounded-md border border-[#dbe4f6] bg-[#f7faff] px-2.5 py-1.5 font-mono text-[12px] text-[#0b1220] placeholder:text-[#93a2bf] focus:border-[#2563eb] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-md bg-[#e8effd] px-2.5 py-1.5 text-[12px] font-medium text-[#2563eb] ring-1 ring-[#c9d8ef] transition hover:bg-[#2563eb]/25"
                  >
                    {t("qr.check")} <ChevronRight size={11} />
                  </button>
                </form>
              </div>
            </div>
          </Panel>
        </div>

        {/* Verdict */}
        <div className="xl:col-span-7">
          <Panel
            className="h-full"
            title={t("qr.verdictTitle")}
            subtitle={payload ? t("qr.verdictLocal") : t("qr.verdictWait")}
            action={
              result && meta ? (
                <Badge tone={meta.tone}>{t(meta.labelKey)}</Badge>
              ) : (
                <Badge tone="slate">{t("qr.idle")}</Badge>
              )
            }
          >
            {!result ? (
              <div className="flex h-full min-h-[430px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <ShieldCheck size={56} className="text-emerald-500/25" strokeWidth={1} />
                <p className="text-[14.5px] font-medium text-[#334155]">
                  {t("qr.idleTitle")}
                </p>
                <p className="max-w-[360px] text-[12px] leading-relaxed text-[#7183a8]">
                  {t("qr.idleBody")}
                </p>
                <div className="mt-2 grid w-full max-w-[420px] grid-cols-2 gap-2 text-left">
                  {[
                    [t("qr.idle1t"), t("qr.idle1b")],
                    [t("qr.idle2t"), t("qr.idle2b")],
                    [t("qr.idle3t"), t("qr.idle3b")],
                    [t("qr.idle4t"), t("qr.idle4b")],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-lg border border-[#eef2fb] bg-[#f7faff] px-2.5 py-2"
                    >
                      <p className="text-[12px] font-medium text-[#334155]">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#93a2bf]">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex flex-col items-center px-4 pb-2 pt-5 text-center">
                  <ShieldEmblem verdict={result.verdict} />
                  <h3 className="mt-1 max-w-[410px] text-[17px] font-semibold leading-snug text-[#0b1220]">
                    {result.verdict === "dangerous"
                      ? t("qr.protected")
                      : result.verdict === "suspicious"
                        ? t("qr.attention")
                        : t("qr.clean")}
                  </h3>
                  <p className="mt-1.5 max-w-[420px] text-[12.5px] leading-relaxed text-[#5b6b8c]">
                    {result.reason}
                  </p>
                  <div className="mt-3 flex w-full max-w-[440px] items-center gap-2 rounded-lg border border-[#eef2fb] bg-[#f7faff] px-2.5 py-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: meta?.color }}
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#334155]">
                      {result.hostname}
                    </span>
                    <span className="tabular text-[12px] font-semibold" style={{ color: meta?.color }}>
                      {t("qr.risk")} {result.score}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full max-w-[440px] overflow-hidden rounded-full bg-[#e8eefb]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(6, result.score)}%`,
                        background: meta?.color,
                        boxShadow: `0 0 10px ${meta?.color}88`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-2 border-t border-[#eef2fb]">
                  <p className="px-3 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#93a2bf]">
                    {t("qr.findings")}
                  </p>
                  <div className="max-h-[190px] divide-y divide-[#eef2fb] overflow-y-auto px-1">
                    {result.findings.map((f) => (
                      <div key={f.label + f.detail} className="flex items-start gap-2 px-2 py-1.5">
                        <span
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            background:
                              f.severity === "high"
                                ? "#ef4444"
                                : f.severity === "medium"
                                  ? "#f59e0b"
                                  : f.severity === "ok"
                                    ? "#34d399"
                                    : "#64748b",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-[#334155]">{f.label}</p>
                          <p className="text-[11px] leading-snug text-[#7183a8]">{f.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#eef2fb] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md bg-[#e8effd] px-3 py-1.5 text-[12px] font-medium text-[#2563eb] ring-1 ring-[#c9d8ef] transition hover:bg-[#2563eb]/25"
                  >
                    {t("qr.scanAnother")}
                  </button>
                  {result.verdict === "safe" ? (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#16a34a] hover:text-[#15803d]"
                    >
                      {t("qr.openSafe")} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#dc2626] hover:text-[#dc2626]"
                    >
                      {t("qr.openAnyway")} <ExternalLink size={11} />
                    </a>
                  )}
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#93a2bf]">
                    <Lock size={10} /> {t("qr.local")}
                  </span>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Panel
            title={t("qr.history")}
            subtitle={t("qr.historySub")}
            action={
              <span className="flex items-center gap-1 text-[11px] text-[#7183a8]">
                <History size={10} /> {t("qr.entries", { n: scans.length })}
              </span>
            }
          >
            {scans.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12px] text-[#93a2bf]">
                {t("qr.noScans")}
              </p>
            ) : (
              <div className="divide-y divide-[#eef2fb]">
                {scans.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 px-3 py-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: verdictMeta[s.verdict].color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[12px] text-[#334155]">{s.url}</p>
                      <p className="truncate text-[11px] text-[#93a2bf]">{s.reason}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#7183a8]">
                      {t("qr.risk")} {s.score}
                    </span>
                    <span className="hidden w-[62px] shrink-0 text-right text-[11px] text-[#93a2bf] sm:block">
                      {timeAgo(new Date(s.createdAt).toISOString())}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="xl:col-span-5">
          <Panel title={t("qr.layers")} subtitle={t("qr.layersSub")}>
            <div className="space-y-2 px-3 py-2.5">
              {[
                {
                  icon: ScanLine,
                  title: t("qr.layer1t"),
                  body: t("qr.layer1b"),
                },
                {
                  icon: ShieldAlert,
                  title: t("qr.layer2t"),
                  body: t("qr.layer2b"),
                },
                {
                  icon: Zap,
                  title: t("qr.layer3t"),
                  body: t("qr.layer3b"),
                },
                {
                  icon: ShieldCheck,
                  title: t("qr.layer4t"),
                  body: t("qr.layer4b"),
                },
              ].map((row) => (
                <div key={row.title} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#eef2fb] bg-[#eef3fb] text-[#2563eb]/80">
                    <row.icon size={12} />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-[#334155]">{row.title}</p>
                    <p className="text-[11px] leading-relaxed text-[#7183a8]">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#eef2fb] px-3 py-2 text-[11px] leading-relaxed text-[#93a2bf]">
              {t("qr.layersNote")}
              <span className="ml-1 text-[#7183a8]">{t("qr.socQueue", { n: data.overview.criticalAlerts })}</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
