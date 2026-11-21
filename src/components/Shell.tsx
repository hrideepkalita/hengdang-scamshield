import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Globe, Menu, ShieldCheck, X } from "lucide-react";
import { languages, useI18n, type Lang } from "../lib/i18n";

const nav = [
  { to: "/", key: "nav.check" },
  { to: "/scanner", key: "nav.qr" },
  { to: "/analytics", key: "nav.analytics" },
  { to: "/graph", key: "nav.graph" },
] as const;

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <label
      className="relative flex shrink-0 items-center gap-1 rounded-full border-2 border-[#dbe4f6] bg-white py-1.5 pl-2.5 pr-6 transition hover:border-[#b7c8e4]"
      title="Language"
    >
      <Globe size={14} className="text-[#2563eb]" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Language"
        className="appearance-none bg-transparent text-[12.5px] font-bold text-[#0b1220] outline-none"
      >
        {languages.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2 text-[#5b6b8c]"
      />
    </label>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[#dbe4f6] bg-[#f4f8ff]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1680px] items-center gap-2.5 px-3 sm:gap-4 sm:px-5">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:shrink-0 sm:gap-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-[#0b1b3f] bg-[#0b1b3f] shadow-[0_4px_0_rgba(11,27,63,0.25)]">
              <img
                src="/brand/hengdang-emblem.webp"
                alt="Hengdang official logo"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="flex items-baseline gap-1 font-display text-[13px] font-extrabold tracking-[0.01em] text-[#0b1220] sm:gap-1.5 sm:text-[15px] sm:tracking-[0.02em]">
                HENGDANG
                <span className="text-[#2563eb]">SCAMSHIELD</span>
              </span>
              <span className="hidden text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#7183a8] sm:block">
                {t("brand.tagline")}
              </span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${
                    isActive
                      ? "text-[#1d4ed8]"
                      : "text-[#5b6b8c] hover:bg-[#e8effd] hover:text-[#0b1220]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(item.key)}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-[15px] h-[3px] rounded-full bg-[#2563eb]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            <LanguageSwitcher />

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full bg-[#2563eb] px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_4px_0_#1e40af] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] sm:flex"
            >
              {t("nav.report")}
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#dbe4f6] bg-white text-[#0b1220] lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-[#dbe4f6] bg-white px-3 py-2 lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2.5 text-[13px] font-semibold ${
                    isActive ? "bg-[#e8effd] text-[#1d4ed8]" : "text-[#5b6b8c] hover:bg-[#f1f6ff]"
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1680px] flex-1 px-3 py-5 sm:px-5">{children}</main>

      <footer className="mt-6 border-t border-[#dbe4f6] bg-[#f7faff]">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-2 px-3 py-4 text-[12px] leading-relaxed text-[#7a89a8] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex flex-wrap items-center gap-1.5">
            <ShieldCheck size={13} className="text-[#16a34a]" />
            <span className="font-display font-extrabold tracking-wide text-[#0b1220]">
              HENGDANG SCAMSHIELD
            </span>
            <span>· {t("brand.tagline")}</span>
          </p>
          <p className="max-w-2xl">{t("footer.note")}</p>
        </div>
      </footer>
    </div>
  );
}
