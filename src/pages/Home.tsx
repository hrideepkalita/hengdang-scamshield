import { Link } from "react-router-dom";
import { ArrowRight, Lock, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { MessageCheck } from "../components/MessageCheck";
import { useI18n } from "../lib/i18n";
import {
  CardSplashArt,
  GlobeReportArt,
  HeroIllustration,
  PhoneSafeArt,
  StepPasteArt,
  StepResultArt,
  StepScanArt,
} from "../components/Illustrations";

const steps = [
  {
    art: StepPasteArt,
    tint: "bg-[#e6f0ff]",
    title: "home.step1t",
    body: "home.step1b",
  },
  {
    art: StepScanArt,
    tint: "bg-[#fff4d6]",
    title: "home.step2t",
    body: "home.step2b",
  },
  {
    art: StepResultArt,
    tint: "bg-[#e3f8ea]",
    title: "home.step3t",
    body: "home.step3b",
  },
] as const;

const learnCards = [
  {
    art: CardSplashArt,
    tint: "bg-[#dcf7e5]",
    title: "home.card1t",
    body: "home.card1b",
    cta: "home.card1cta",
    to: "tel:1930",
    external: false,
  },
  {
    art: GlobeReportArt,
    tint: "bg-[#e2efff]",
    title: "home.card2t",
    body: "home.card2b",
    cta: "home.card2cta",
    to: "https://cybercrime.gov.in",
    external: true,
  },
  {
    art: PhoneSafeArt,
    tint: "bg-[#ffe6f0]",
    title: "home.card3t",
    body: "home.card3b",
    cta: "home.card3cta",
    to: "/analytics",
    external: false,
  },
] as const;

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="pb-4">
      {/* Hero + priority checker */}
      <section className="mx-auto max-w-3xl pt-2 text-center sm:pt-6">
        <HeroIllustration className="hero-float mx-auto h-[150px] w-auto sm:h-[205px]" />

        <h1 className="mt-3 font-display text-[34px] font-extrabold leading-[1.12] tracking-tight text-[#0b1220] sm:text-[52px]">
          {t("home.heroA")}
          <span className="text-[#2563eb]">{t("home.heroB")}</span>
          {t("home.heroC")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[13.5px] font-medium leading-relaxed text-[#526181] sm:text-[15px]">
          {t("home.sub")}
        </p>

        <div className="mx-auto mt-4 flex w-fit max-w-full items-center gap-2 rounded-full border border-[#f3c7a8] bg-[#fff3e8] px-3.5 py-1.5">
          <span className="live-dot !bg-[#f97316]" />
          <p className="text-[11px] leading-snug text-[#7c4a1e] sm:text-[12px]">
            <strong className="font-extrabold text-[#0b1220]">{t("home.statA")}</strong>{" "}
            {t("home.statB")}
          </p>
        </div>

        <MessageCheck />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-[#7183a8]">
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-[#16a34a]" /> {t("home.trust1")}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[#16a34a]" /> {t("home.trust2")}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#f59e0b]" /> {t("home.trust3")}
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-14 w-full max-w-6xl sm:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-[28px] font-extrabold tracking-tight text-[#0b1220] sm:text-[36px]">
            {t("home.how")}
          </h2>
          <Link
            to="/scanner"
            className="group inline-flex items-center gap-1 text-[12px] font-bold text-[#2563eb]"
          >
            {t("home.howLink")}
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col">
              <div
                className={`relative overflow-hidden rounded-3xl border-2 border-[#e2eaf9] ${step.tint} px-3 py-3`}
              >
                <step.art className="mx-auto h-[150px] w-full max-w-[250px]" />
                <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full border-2 border-[#0b1b3f] bg-white font-display text-[12px] font-extrabold text-[#0b1220]">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[15px] font-extrabold leading-snug text-[#0b1220]">
                {t(step.title)}
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-[#5b6b8c]">{t(step.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn */}
      <section className="mx-auto mt-14 w-full max-w-6xl sm:mt-20">
        <h2 className="font-display text-[28px] font-extrabold tracking-tight text-[#0b1220] sm:text-[36px]">
          {t("home.learn")}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {learnCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-3xl border-2 border-[#e2eaf9] bg-white p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-26px_rgba(15,23,42,0.45)]"
            >
              <div className={`overflow-hidden rounded-2xl ${card.tint} px-2 py-2`}>
                <card.art className="h-[150px] w-full" />
              </div>
              <h3 className="mt-3 px-1 font-display text-[18px] font-extrabold text-[#0b1220]">
                {t(card.title)}
              </h3>
              <p className="mt-1 px-1 text-[12.5px] leading-relaxed text-[#5b6b8c]">
                {t(card.body)}
              </p>
              {card.external ? (
                <a
                  href={card.to}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-4 flex items-center gap-1 px-1 pb-1 text-[12px] font-bold text-[#2563eb]"
                >
                  {t(card.cta)}
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </a>
              ) : (
                <Link
                  to={card.to}
                  className="group mt-4 flex items-center gap-1 px-1 pb-1 text-[12px] font-bold text-[#2563eb]"
                >
                  {t(card.cta)}
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emergency */}
      <section className="mx-auto mt-12 w-full max-w-6xl">
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-[#ffd2c7] bg-[#fff3ef] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#ef4444] text-white">
              <PhoneCall size={18} />
            </span>
            <div>
              <p className="font-display text-[15px] font-extrabold text-[#0b1220]">
                {t("home.emergencyT")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[#7a5a52]">
                {t("home.emergencyB")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href="tel:1930"
              className="rounded-full border-2 border-[#0b1b3f] bg-white px-3.5 py-2 text-[11.5px] font-bold text-[#0b1220] transition hover:-translate-y-0.5"
            >
              {t("home.call")}
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#0b1b3f] px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:-translate-y-0.5"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-[#7a89a8]">{t("home.disclaimer")}</p>
      </section>
    </div>
  );
}
