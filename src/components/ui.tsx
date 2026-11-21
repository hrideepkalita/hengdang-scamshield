import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  compact = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  compact?: boolean;
}) {
  return (
    <section className={`panel ${compact ? "min-h-0" : ""} ${className}`}>
      {title && (
        <header className="panel-header">
          <div className="min-w-0">
            <h2 className="panel-title truncate">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-[#93a2bf] truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`flex-1 min-w-0 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "slate",
  dot = false,
}: {
  children: ReactNode;
  tone?: "slate" | "red" | "orange" | "amber" | "sky" | "green" | "violet";
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    slate: "text-[#5b6b8c] bg-[#eef2fb] ring-[#dbe4f6]",
    red: "text-[#b91c1c] bg-[#fdeceb] ring-[#f6c9c5]",
    orange: "text-[#c2410c] bg-[#fff1e8] ring-[#f8d4bd]",
    amber: "text-[#b45309] bg-[#fff6e6] ring-[#f6dfb4]",
    sky: "text-[#1d4ed8] bg-[#e8effd] ring-[#c9d8ef]",
    green: "text-[#15803d] bg-[#e3f8ea] ring-[#b7e8c8]",
    violet: "text-[#6d28d9] bg-[#f1ecfe] ring-[#ddd0fa]",
  };
  return (
    <span className={`chip ring-1 ${tones[tone]}`}>
      {dot && <span className="h-1 w-1 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="chip ring-1 ring-[#b7e8c8] bg-[#e3f8ea] text-[#15803d]">
      <span className="live-dot" />
      Live feed
    </span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  hint,
  accent = "#38bdf8",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="kpi" style={{ "--kpi-accent": accent } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.13em] text-[#7183a8]">
            {label}
          </p>
          <p className="tabular mt-1.5 text-[24px] font-extrabold leading-none text-[#0b1220]">
            {value}
          </p>
          {(delta || hint) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#7183a8]">
              {delta && (
                <span className="font-semibold" style={{ color: accent }}>
                  {delta}
                </span>
              )}
              {hint && <span className="truncate">{hint}</span>}
            </p>
          )}
        </div>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1"
          style={{
            color: accent,
            background: `${accent}14`,
            boxShadow: `inset 0 0 18px ${accent}18`,
            borderColor: `${accent}33`,
          }}
        >
          <Icon size={17} strokeWidth={1.9} />
        </span>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: readonly { value: T; label: string }[] | readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  ) as { value: T; label: string }[];
  return (
    <div className={`seg ${className}`}>
      {normalized.map((o) => (
        <button
          key={o.value}
          type="button"
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LegendDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value?: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#5b6b8c]">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
      {value && <span className="text-[#93a2bf]">· {value}</span>}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-extrabold tracking-tight text-[#0b1220] sm:text-[26px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-[#7183a8]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Activity size={18} className="text-[#93a2bf]" />
      <p className="text-[12.5px] text-[#7183a8]">{label}</p>
    </div>
  );
}
