const navy = "#0b1b3f";
const blue = "#2f6bff";
const sky = "#d9ebff";
const mint = "#c6f2d4";
const yellow = "#ffc93c";
const pink = "#ffd9e8";
const orange = "#ff8a3d";

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" className={className} aria-hidden>
      <ellipse cx="150" cy="204" rx="112" ry="9" fill="#c9d8f2" opacity="0.55" />

      {/* chains */}
      <path
        d="M96 58c22-22 60-28 88-8"
        fill="none"
        stroke={yellow}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M96 58c22-22 60-28 88-8"
        fill="none"
        stroke={navy}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="2 15"
        opacity="0.85"
      />

      {/* laptop screen */}
      <rect x="58" y="18" width="184" height="130" rx="13" fill="#ffffff" stroke={navy} strokeWidth="4" />
      <rect x="71" y="32" width="158" height="102" rx="7" fill={sky} stroke={navy} strokeWidth="2.5" />
      <circle cx="81" cy="41" r="2.4" fill={navy} />
      <circle cx="89" cy="41" r="2.4" fill={navy} />
      <circle cx="97" cy="41" r="2.4" fill={navy} />

      {/* warning inside screen */}
      <path
        d="M150 47l19 32h-38z"
        fill={orange}
        stroke={navy}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M150 57v11" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="150" cy="74" r="2.4" fill="#ffffff" />

      {/* chain hugging the lock */}
      <path
        d="M96 86c-14 3-24 12-28 25"
        fill="none"
        stroke={yellow}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M96 86c-14 3-24 12-28 25"
        fill="none"
        stroke={navy}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray="2 13"
        opacity="0.75"
      />
      <path
        d="M204 86c14 3 24 12 28 25"
        fill="none"
        stroke={yellow}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M204 86c14 3 24 12 28 25"
        fill="none"
        stroke={navy}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray="2 13"
        opacity="0.75"
      />

      {/* keyboard deck */}
      <path
        d="M40 158h220l20 34c2 5-1 8-6 8H26c-5 0-8-3-6-8z"
        fill="#eef4ff"
        stroke={navy}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {[0, 1].map((row) =>
        Array.from({ length: 9 }).map((_, i) => (
          <rect
            key={`${row}-${i}`}
            x={62 + i * 20 + row * 4}
            y={166 + row * 12}
            width="15"
            height="8"
            rx="2"
            fill="#ffffff"
            stroke="#c3d4ee"
            strokeWidth="1.4"
          />
        )),
      )}
      <rect x="116" y="189" width="72" height="7" rx="3" fill="#ffffff" stroke="#c3d4ee" strokeWidth="1.4" />

      {/* padlock */}
      <path
        d="M134 92V79a18 18 0 0 1 36 0v13"
        fill="none"
        stroke={navy}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="124" y="90" width="56" height="46" rx="8" fill={yellow} stroke={navy} strokeWidth="4" />
      <circle cx="152" cy="109" r="6" fill={navy} />
      <path d="M152 112v11" stroke={navy} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function CardSplashArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <path
        d="M36 96c10-12 26-8 38-16 8-5 12-14 24-14 10 0 12 8 24 7 16-2 22 8 34 9 10 1 20-3 28 4"
        fill="none"
        stroke={blue}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.55"
      />
      <g transform="rotate(-16 110 62)">
        <rect x="58" y="24" width="112" height="72" rx="10" fill="#ffffff" stroke={navy} strokeWidth="4" />
        <rect x="58" y="36" width="112" height="16" fill={sky} stroke={navy} strokeWidth="2" />
        <rect x="70" y="60" width="24" height="18" rx="3" fill={yellow} stroke={navy} strokeWidth="2.5" />
        <path d="M74 66h16M74 72h16" stroke={navy} strokeWidth="1.6" />
        <path d="M104 64h50M104 72h34" stroke={navy} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
      <path
        d="M150 92c10-4 16 2 14 10-2 7-10 9-16 5"
        fill="none"
        stroke={blue}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="104" r="5" fill={blue} opacity="0.6" />
      <circle cx="66" cy="112" r="3" fill={blue} opacity="0.45" />
    </svg>
  );
}

export function GlobeReportArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <circle cx="124" cy="72" r="46" fill={blue} stroke={navy} strokeWidth="4" />
      <ellipse cx="124" cy="72" rx="20" ry="46" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
      <path d="M80 60h88M80 84h88" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
      <path
        d="M78 72c0-26 20-46 46-46"
        fill="none"
        stroke={navy}
        strokeWidth="3.5"
        opacity="0.5"
      />
      <g transform="rotate(-8 62 44)">
        <rect x="22" y="20" width="78" height="52" rx="7" fill="#ffffff" stroke={navy} strokeWidth="3.5" />
        <rect x="22" y="30" width="78" height="9" fill={sky} stroke={navy} strokeWidth="2" />
        <rect x="32" y="46" width="34" height="7" rx="3.5" fill={mint} stroke={navy} strokeWidth="1.8" />
        <rect x="32" y="58" width="52" height="5" rx="2.5" fill="#d7e3f7" />
      </g>
      <path
        d="M170 96c14-2 22 8 18 18"
        fill="none"
        stroke={orange}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="188" cy="34" r="4" fill={yellow} stroke={navy} strokeWidth="2" />
    </svg>
  );
}

export function PhoneSafeArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <rect x="66" y="18" width="88" height="110" rx="16" fill="#ffffff" stroke={navy} strokeWidth="4" />
      <rect x="76" y="34" width="68" height="76" rx="8" fill={pink} stroke={navy} strokeWidth="2.5" />
      <path d="M76 90l22-26 18 20 12-12 16 18" fill={blue} opacity="0.85" />
      <circle cx="110" cy="119" r="4" fill={navy} opacity="0.4" />
      <g transform="rotate(8 158 74)">
        <rect x="130" y="40" width="62" height="58" rx="12" fill={mint} stroke={navy} strokeWidth="3.5" />
        <path d="M147 68l9 9 18-20" fill="none" stroke={navy} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M150 84h24" stroke={navy} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      </g>
      <path d="M42 42l-8-8M36 54h-10M46 28v-9" stroke={yellow} strokeWidth="5" strokeLinecap="round" />
      <circle cx="44" cy="88" r="5" fill={orange} />
    </svg>
  );
}

export function StepPasteArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden>
      <rect x="26" y="22" width="148" height="108" rx="16" fill="#ffffff" stroke={navy} strokeWidth="4" />
      <rect x="26" y="40" width="148" height="20" fill={sky} stroke={navy} strokeWidth="2" />
      <circle cx="40" cy="31" r="2.6" fill={navy} />
      <circle cx="49" cy="31" r="2.6" fill={navy} />
      <rect x="42" y="70" width="116" height="22" rx="11" fill="#f2f7ff" stroke={navy} strokeWidth="3" />
      <path d="M56 81h46" stroke="#a9bede" strokeWidth="4" strokeLinecap="round" />
      <circle cx="144" cy="81" r="6" fill="#ffffff" stroke={navy} strokeWidth="2.5" />
      <path d="M140 86l6 8" stroke={navy} strokeWidth="4" strokeLinecap="round" />
      <path d="M42 108h34M42 117h20" stroke="#c3d4ee" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 118l10 8-14 0z" fill={blue} stroke={navy} strokeWidth="2" />
    </svg>
  );
}

export function StepScanArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden>
      <rect x="26" y="26" width="128" height="30" rx="10" fill="#ffffff" stroke={navy} strokeWidth="3.5" />
      <circle cx="42" cy="41" r="6" fill={mint} stroke={navy} strokeWidth="2" />
      <path d="M58 38h52M58 46h30" stroke={navy} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <rect x="46" y="66" width="128" height="30" rx="10" fill="#ffffff" stroke={navy} strokeWidth="3.5" />
      <path d="M60 76l8 10h-16z" fill={orange} stroke={navy} strokeWidth="2" strokeLinejoin="round" />
      <path d="M84 76h58M84 84h36" stroke={navy} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <rect x="26" y="106" width="106" height="26" rx="10" fill="#ffffff" stroke={navy} strokeWidth="3.5" />
      <path d="M42 114h58M42 122h36" stroke={navy} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <circle cx="136" cy="86" r="30" fill="#eaf2ff" fillOpacity="0.55" stroke={yellow} strokeWidth="8" />
      <path d="M158 108l16 18" stroke={blue} strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function StepResultArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden>
      <rect x="28" y="20" width="112" height="112" rx="16" fill="#ffffff" stroke={navy} strokeWidth="4" />
      <path d="M46 44h54M46 58h70M46 72h46M46 86h62M46 100h38" stroke="#c9d8ef" strokeWidth="7" strokeLinecap="round" />
      <g transform="rotate(-4 146 88)">
        <rect x="104" y="56" width="76" height="68" rx="14" fill="#ffffff" stroke={navy} strokeWidth="4" />
        <circle cx="142" cy="80" r="14" fill={mint} stroke={navy} strokeWidth="3" />
        <path d="M136 80l5 5 9-11" fill="none" stroke={navy} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M120 102h44M120 112h28" stroke="#c9d8ef" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function QRHeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" className={className} aria-hidden>
      <ellipse cx="150" cy="204" rx="104" ry="9" fill="#c9d8f2" opacity="0.55" />
      <rect x="78" y="16" width="144" height="176" rx="24" fill="#ffffff" stroke={navy} strokeWidth="4" />
      <rect x="90" y="34" width="120" height="140" rx="12" fill="#eef5ff" stroke={navy} strokeWidth="2.5" />
      <rect x="104" y="48" width="92" height="92" rx="8" fill="#ffffff" stroke={navy} strokeWidth="3" />
      <g fill={navy}>
        <rect x="114" y="58" width="20" height="20" rx="3" />
        <rect x="166" y="58" width="20" height="20" rx="3" />
        <rect x="114" y="110" width="20" height="20" rx="3" />
        <rect x="140" y="58" width="8" height="8" />
        <rect x="140" y="74" width="8" height="8" />
        <rect x="156" y="82" width="8" height="8" />
        <rect x="140" y="98" width="8" height="8" />
        <rect x="156" y="106" width="8" height="8" />
        <rect x="140" y="114" width="18" height="8" />
        <rect x="166" y="90" width="8" height="8" />
        <rect x="176" y="106" width="8" height="8" />
      </g>
      <path d="M96 96h-12M108 96h8" stroke={navy} strokeWidth="3" opacity="0.35" />
      <circle cx="150" cy="165" r="15" fill={yellow} stroke={navy} strokeWidth="3" />
      <path d="M144 165l4 5 8-10" fill="none" stroke={navy} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M212 46l10-8M218 64h12M208 30v-10" stroke={yellow} strokeWidth="6" strokeLinecap="round" />
      <circle cx="66" cy="76" r="6" fill={orange} />
      <circle cx="238" cy="132" r="8" fill={blue} opacity="0.5" />
      <path d="M228 156l12 14" stroke={mint} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
