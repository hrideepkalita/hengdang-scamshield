import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ImageUp,
  Link2,
  Loader2,
  Lock,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { analyzeMessage, type MessageAnalysis } from "../lib/message";
import { extractTextFromImage } from "../lib/ocr";
import { useI18n } from "../lib/i18n";

type Tab = "text" | "image" | "link";

const EXAMPLE =
  "Dear customer, your SBI account will be blocked today because KYC is pending. Complete verification within 24 hours at http://secure-kyc-verify-bank.top/login?session=kyc to avoid suspension.";

const verdictMeta = {
  dangerous: {
    color: "#ef4444",
    icon: ShieldAlert,
    badge: "mc.high",
  },
  suspicious: {
    color: "#d97706",
    icon: AlertTriangle,
    badge: "mc.suspicious",
  },
  safe: {
    color: "#16a34a",
    icon: ShieldCheck,
    badge: "mc.safe",
  },
} as const;

const severityColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#94a3b8",
};

const primaryBtn =
  "flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c5cfc] px-4 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_0_#1e40af] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

const secondaryBtn =
  "flex items-center gap-1.5 rounded-full border-2 border-[#dbe4f6] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#42527a] transition hover:border-[#2563eb] hover:text-[#1d4ed8]";

export function MessageCheck() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<{ label: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // One owner for the screenshot blob URL, so replacing or clearing a preview
  // cannot leak the previous object URL.
  const replacePreview = useCallback((url: string | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreview(url);
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!analysis) return;
    const id = window.setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      120,
    );
    return () => window.clearTimeout(id);
  }, [analysis]);

  const runCheck = (input: string) => {
    const value = input.trim();
    if (!value) return;
    const result = analyzeMessage(value);
    setAnalysis(result);
    setError(null);
  };

  const reset = () => {
    setAnalysis(null);
    setText("");
    setLinkInput("");
    setError(null);
    replacePreview(null);
    setOcrStatus(null);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("mc.errType"));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError(t("mc.errSize"));
      return;
    }

    setError(null);
    setAnalysis(null);
    setBusy(true);
    setOcrStatus({ label: t("mc.engine"), progress: 0 });
    replacePreview(URL.createObjectURL(file));

    try {
      const extracted = await extractTextFromImage(file, (label, progress) =>
        setOcrStatus({ label, progress }),
      );
      setOcrStatus(null);

      if (!extracted || extracted.replace(/\s/g, "").length < 12) {
        setError(t("mc.errNoText"));
        return;
      }
      setText(extracted);
      runCheck(extracted);
    } catch {
      setOcrStatus(null);
      setError(t("mc.errOcr"));
    } finally {
      setBusy(false);
    }
  };

  const meta = analysis ? verdictMeta[analysis.verdict] : null;
  const canCheck = text.trim().length > 0;
  const linkReady = linkInput.trim().length > 3;

  const tabs: { id: Tab; label: "mc.tabText" | "mc.tabImage" | "mc.tabLink"; short: "mc.tabTextShort" | "mc.tabImageShort" | "mc.tabLinkShort"; icon: typeof MessageSquareText }[] = [
    { id: "text", label: "mc.tabText", short: "mc.tabTextShort", icon: MessageSquareText },
    { id: "image", label: "mc.tabImage", short: "mc.tabImageShort", icon: ImageUp },
    { id: "link", label: "mc.tabLink", short: "mc.tabLinkShort", icon: Link2 },
  ];

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl text-left">
      <div className="gradient-card p-3 sm:p-5">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="seg w-full sm:w-auto">
            {tabs.map(({ id, label, short, icon: Icon }) => (
              <button
                key={id}
                type="button"
                data-active={tab === id}
                onClick={() => {
                  setTab(id);
                  setError(null);
                }}
                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 sm:flex-none sm:px-3"
              >
                <Icon size={13} className="shrink-0" />
                <span className="hidden sm:inline">{t(label)}</span>
                <span className="sm:hidden">{t(short)}</span>
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#7183a8]">
            <Lock size={11} className="text-[#16a34a]" />
            {t("mc.deviceNote")}
          </span>
        </div>

        {/* Text */}
        {tab === "text" && (
          <div className="mt-4">
            <label htmlFor="message-text" className="sr-only">
              Paste the suspicious message
            </label>
            <textarea
              id="message-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("mc.placeholder")}
              className="min-h-[150px] w-full resize-y rounded-2xl border-2 border-[#dbe4f6] bg-[#f7faff] p-3.5 text-[14.5px] leading-relaxed text-[#0b1220] placeholder:text-[#93a2bf] focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" disabled={!canCheck} onClick={() => runCheck(text)} className={primaryBtn}>
                {t("mc.checkMsg")} <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(EXAMPLE);
                  runCheck(EXAMPLE);
                }}
                className={secondaryBtn}
              >
                <Sparkles size={12} /> {t("mc.example")}
              </button>
              <span className="ml-auto text-[12px] text-[#93a2bf]">
                {text.trim()
                  ? t("mc.words", { n: text.trim().split(/\s+/).length })
                  : t("mc.englishOnly")}
              </span>
            </div>
          </div>
        )}

        {/* Screenshot */}
        {tab === "image" && (
          <div className="mt-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void onFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                dragging
                  ? "border-[#2563eb] bg-[#eef4ff]"
                  : "border-[#c9d8ef] bg-[#f7faff]"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Uploaded message screenshot"
                  className="max-h-52 rounded-xl border border-[#dbe4f6] object-contain"
                />
              ) : (
                <>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#dbe4f6] bg-white">
                    <Upload size={18} className="text-[#2563eb]" />
                  </span>
                  <p className="text-[14px] font-bold text-[#0b1220]">
                    {t("mc.dropTitle")}
                  </p>
                  <p className="max-w-sm text-[12px] leading-relaxed text-[#7183a8]">
                    {t("mc.dropBody")}
                  </p>
                </>
              )}

              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className={primaryBtn}
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <ImageUp size={13} />}
                  {busy ? t("mc.reading") : preview ? t("mc.chooseAnother") : t("mc.choose")}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      replacePreview(null);
                      setError(null);
                      setOcrStatus(null);
                    }}
                    className={secondaryBtn}
                  >
                    {t("mc.remove")}
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  void onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            {ocrStatus && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[12px] font-medium text-[#526181]">
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={11} className="animate-spin" /> {ocrStatus.label}…
                  </span>
                  <span className="tabular">{Math.round(ocrStatus.progress * 100)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e8eefb]">
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-all"
                    style={{ width: `${Math.max(4, ocrStatus.progress * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {text && !ocrStatus && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message-text-ocr"
                    className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7183a8]"
                  >
                    {t("mc.ocrLabel")}
                  </label>
                  <span className="text-[12px] text-[#93a2bf]">{t("mc.editable")}</span>
                </div>
                <textarea
                  id="message-text-ocr"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-1.5 min-h-[96px] w-full resize-y rounded-2xl border-2 border-[#dbe4f6] bg-[#f7faff] p-3 text-[13.5px] leading-relaxed text-[#0b1220] focus:border-[#2563eb] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!canCheck}
                  onClick={() => runCheck(text)}
                  className={`${primaryBtn} mt-2`}
                >
                  {t("mc.checkMsg")} <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Link */}
        {tab === "link" && (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (linkReady) {
                setText(linkInput.trim());
                runCheck(linkInput);
              }
            }}
          >
            <label htmlFor="message-link" className="sr-only">
              Paste a link
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="message-link"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://secure-kyc-verify.example/login"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-full border-2 border-[#dbe4f6] bg-[#f7faff] px-4 py-3 font-mono text-[14px] text-[#0b1220] placeholder:text-[#93a2bf] focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10"
              />
              <button type="submit" disabled={!linkReady} className={primaryBtn}>
                {t("mc.checkLink")} <ArrowRight size={14} />
              </button>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#7183a8]">
              {t("mc.linkHelp")}
            </p>
          </form>
        )}

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#f6d3a7] bg-[#fff8ee] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#8a4b12]">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {/* Result */}
        {analysis && meta && (
          <div ref={resultRef} className="mt-5 border-t-2 border-[#eef2fb] pt-5" aria-live="polite">
            <div
              className="rounded-2xl border-2 p-3.5"
              style={{
                borderColor: `${meta.color}55`,
                background: `linear-gradient(180deg, ${meta.color}12, transparent 90%)`,
              }}
            >
              <div className="flex flex-wrap items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  style={{ background: `${meta.color}1a`, color: meta.color }}
                >
                  <meta.icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[12px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: meta.color }}
                  >
                    {t(meta.badge)} · {analysis.category}
                  </p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-[#334155]">
                    {analysis.summary}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-extrabold leading-none text-[#0b1220]">
                    {analysis.score}
                    <span className="text-[12.5px] font-normal text-[#93a2bf]">/100</span>
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#93a2bf]">
                    {t("mc.risk")}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8eefb]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${analysis.score}%`, background: meta.color }}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7183a8]">
                  {t("mc.noticed")}
                </h3>
                <ul className="mt-2 space-y-2">
                  {analysis.signals.map((signal, index) => (
                    <li key={`${signal.label}-${index}`} className="flex gap-2.5">
                      <span
                        className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: severityColor[signal.severity] }}
                      />
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#0b1220]">{signal.label}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-[#7183a8]">
                          {signal.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7183a8]">
                  {t("mc.actions")}
                </h3>
                <ol className="mt-2 space-y-2">
                  {analysis.actions.map((action, index) => (
                    <li key={action} className="flex gap-2.5">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#e8effd] text-[11px] font-bold text-[#2563eb]">
                        {index + 1}
                      </span>
                      <p className="text-[13px] leading-relaxed text-[#526181]">{action}</p>
                    </li>
                  ))}
                </ol>

                {analysis.links.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7183a8]">
                      {t("mc.linksTitle")}
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {analysis.links.slice(0, 4).map((link, index) => (
                        <li
                          key={`${link.url}-${index}`}
                          className="flex items-center gap-2 rounded-xl border border-[#e2eaf9] bg-[#f7faff] px-2.5 py-1.5"
                        >
                          <Link2 size={11} className="shrink-0 text-[#93a2bf]" />
                          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#526181]">
                            {link.hostname}
                          </span>
                          <span
                            className="shrink-0 text-[11px] font-bold"
                            style={{
                              color:
                                link.verdict === "dangerous"
                                  ? "#dc2626"
                                  : link.verdict === "suspicious"
                                    ? "#b45309"
                                    : "#15803d",
                            }}
                          >
                            {link.verdict === "dangerous"
                              ? t("mc.dangerous")
                              : link.verdict === "suspicious"
                                ? t("mc.suspiciousLink")
                                : t("mc.noFlags")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-[#eef2fb] pt-3">
              <span className="flex items-center gap-1.5 text-[12px] text-[#93a2bf]">
                <CheckCircle2 size={12} className="text-[#93a2bf]" />
                {t("mc.heuristic")}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {analysis.verdict !== "safe" && (
                  <>
                    <a
                      href="https://cybercrime.gov.in"
                      target="_blank"
                      rel="noreferrer"
                      className={secondaryBtn}
                    >
                      {t("mc.report")} <ExternalLink size={10} />
                    </a>
                    <a href="tel:1930" className={secondaryBtn}>
                      {t("mc.call")}
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-[#0b1b3f] px-3.5 py-2 text-[12.5px] font-bold text-white transition hover:bg-[#16294f]"
                >
                  {t("mc.again")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
