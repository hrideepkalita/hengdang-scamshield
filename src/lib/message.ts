import { analyzeUrl, type UrlAnalysis, type Verdict } from "./scan";

export interface MessageSignal {
  label: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

export interface MessageAnalysis {
  score: number;
  verdict: Verdict;
  label: string;
  category: string;
  summary: string;
  signals: MessageSignal[];
  links: UrlAnalysis[];
  actions: string[];
  words: number;
}

interface Rule {
  label: string;
  detail: string;
  severity: MessageSignal["severity"];
  weight: number;
  pattern: RegExp;
  category?: string;
  action?: string;
}

/**
 * Rules are ordered from most to least specific: the first matched rule that
 * carries a category names the scam type shown to the user.
 */
const RULES: Rule[] = [
  {
    label: "Remote-access app requested",
    detail:
      "Scammers ask you to install an APK or a screen-sharing app so they can read your banking SMS and OTPs.",
    severity: "high",
    weight: 30,
    pattern:
      /(\.apk\b|install (this|the|our) app|download (this|the|our) app|any ?desk|team ?viewer|quick ?support|screen shar|remote access)/i,
    category: "Remote-access / banking trojan",
    action:
      "Never install an app sent over SMS or WhatsApp. Banking apps come only from the Play Store or App Store.",
  },
  {
    label: "OTP, PIN or password requested",
    detail:
      "No bank, courier, government office or support agent will ever ask for an OTP, UPI PIN, CVV or password.",
    severity: "high",
    weight: 28,
    pattern:
      /(otp|one[- ]time (password|code)|verification code|upi (pin|id)?\s*pin|cvv|debit card (number|pin)|net ?banking password|share (your )?(pin|password))/i,
    category: "Credential & OTP theft",
    action:
      "Never share an OTP, UPI PIN, CVV or password. If you already did, freeze the account from the official app and call 1930.",
  },
  {
    label: "UPI collect / payment request",
    detail:
      "A UPI collect request moves money out of your account as soon as you approve it. Receiving money never needs your PIN.",
    severity: "high",
    weight: 24,
    pattern: /(upi|@(ok(axis|hdfcbank|icici|sbi)|paytm|ybl|ibl|axl|apl)\b|collect request|request money|scan (this|the) qr)/i,
    category: "UPI / payment fraud",
    action:
      "Reject UPI collect requests you did not start. Approving one sends money; it never receives it.",
  },
  {
    label: "Parcel held for a fee",
    detail:
      "Fake courier and India Post messages ask for a small “re-delivery” or customs fee to steal card details.",
    severity: "high",
    weight: 20,
    pattern:
      /(parcel|courier|consignment|shipment|india post|speed post|blue ?dart|dtdc|delhivery|fedex|dhl).{0,80}(fee|charge|held|stuck|customs|address|delivery failed|attempt)/i,
    category: "Delivery / parcel scam",
    action:
      "Track a parcel only inside the courier’s official app or website. No courier collects a fee through a link in an SMS.",
  },
  {
    label: "Government authority impersonation",
    detail:
      "Messages posing as income tax, GST, EPFO, UIDAI, police or the electricity board use fear to force quick payment.",
    severity: "high",
    weight: 22,
    pattern:
      /(income tax|gst|epfo|uidai|aadhaar|pan card|cyber ?cell|police|cbi|trai|court|legal action|digital arrest|electricity|discom|power (bill|connection))/i,
    category: "Government impersonation",
    action:
      "Government offices never demand payment or “arrest” over a call, SMS or WhatsApp. Verify on the official portal yourself.",
  },
  {
    label: "Account blocked / suspended threat",
    detail:
      "A threat to block, freeze or close your account is a pressure tactic used to rush you into a fake login page.",
    severity: "high",
    weight: 18,
    pattern:
      /(account|card|sim|service|connection).{0,50}(block(ed)?|suspend(ed)?|deactivat|frozen|closed|disconnected)/i,
    category: "Bank / KYC fraud",
    action:
      "Open your bank’s own app to check the account. Do not use the link in the message.",
  },
  {
    label: "KYC or re-verification demand",
    detail:
      "“Complete KYC” messages are a standard lure for fake bank pages that capture your credentials.",
    severity: "medium",
    weight: 16,
    pattern: /(kyc|re-?kyc|re-?verif|update (your )?(account|details|pan|address)|complete (your )?verification)/i,
    category: "Bank / KYC fraud",
    action: "Complete KYC only at a bank branch or inside the bank’s official app.",
  },
  {
    label: "Lottery, prize or windfall",
    detail:
      "You cannot win a draw you never entered. Prize messages always lead to a fee or a data grab.",
    severity: "high",
    weight: 18,
    pattern:
      /(won|lucky (draw|winner)|lottery|jackpot|prize|reward|gift|iphone|scratch card|cash ?back)/i,
    category: "Lottery / prize scam",
    action: "Do not pay any “processing fee” or tax to claim a prize. Delete the message.",
  },
  {
    label: "Job or task offer",
    detail:
      "Part-time task and “earn from home” offers on WhatsApp or Telegram are usually paid-review fraud.",
    severity: "medium",
    weight: 15,
    pattern:
      /(part[- ]time|work from home|earn (₹|rs|up to)|daily (income|payout)|job offer|hiring|telegram|task|commission|joining fee|registration fee)/i,
    category: "Job / task scam",
    action:
      "No real employer asks for a joining or training fee. Stop once a “task” asks you to deposit money.",
  },
  {
    label: "Investment or loan promise",
    detail:
      "Guaranteed returns and instant pre-approved loans are the two most common financial lures in India.",
    severity: "medium",
    weight: 15,
    pattern:
      /(guaranteed? (return|profit)|double your money|trading (group|tips)|investment plan|pre-?approved loan|instant loan|credit limit|low interest|loan app)/i,
    category: "Investment / loan scam",
    action:
      "Check SEBI/RBI registration before investing or borrowing. Never pay an upfront “processing fee”.",
  },
  {
    label: "Urgency or a deadline",
    detail:
      "A short deadline (“within 24 hours”, “today”, “last warning”) is designed to stop you from verifying.",
    severity: "medium",
    weight: 12,
    pattern:
      /(within \d+ ?(hour|hr|minute|min|day)s?|immediately|urgent|last (date|chance|warning)|final (notice|warning)|expir(es|ing|ed)|act now|today only|hurry)/i,
  },
  {
    label: "Payment or fee requested",
    detail:
      "Being asked to pay to receive a refund, parcel, prize or job is a strong sign of fraud.",
    severity: "medium",
    weight: 12,
    pattern:
      /(pay (₹|rs|inr|now|a|the)|processing fee|delivery (fee|charge)|re-?delivery (fee|charge)|security deposit|advance payment|transfer (₹|rs|money)|refund)/i,
  },
  {
    label: "Suspicious contact channel",
    detail:
      "Official organisations rarely move a conversation to a personal WhatsApp or Telegram number.",
    severity: "low",
    weight: 9,
    pattern: /(whats ?app|wa\.me|telegram|t\.me|dm me|message me on)/i,
  },
  {
    label: "Generic or impersonated greeting",
    detail:
      "“Dear customer” instead of your name is typical of bulk fraud messages pretending to be your bank.",
    severity: "low",
    weight: 7,
    pattern: /(dear (customer|user|sir|madam|member)|valued (customer|client)|dear (account|card) holder)/i,
  },
  {
    label: "Phone number pushed for a callback",
    detail:
      "A number in the message usually leads to a fake “support” agent who talks you through the theft.",
    severity: "medium",
    weight: 10,
    pattern: /(call (us|me|this)|helpline|customer care|toll[- ]?free|contact (us|me)|\+91[\s-]?\d{5}[\s-]?\d{5}|\b[6-9]\d{9}\b)/i,
    category: "Fake customer care",
    action:
      "Call the number printed on your card, bill or the official website — never the number in a suspicious message.",
  },
];

const URL_PATTERN =
  /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|upi:\/\/[^\s<>"']+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,24})(?:\/[^\s<>"']*)?)/gi;

const CORE_ACTIONS = [
  "Do not tap any link or call any number in this message.",
  "Never share an OTP, UPI PIN, CVV or password — not even with someone claiming to be your bank.",
  "Verify through the official app or the number printed on your card or bill.",
];

const REPORT_ACTION =
  "If you already shared details or lost money, call 1930 and file a report at cybercrime.gov.in within 24 hours.";

export function extractLinks(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? [];
  const cleaned = matches
    .map((value) => value.replace(/[.,;:!?)\]}'"]+$/g, ""))
    .filter((value) => value.length > 3);
  return Array.from(new Set(cleaned.map((value) => value.trim())));
}

export function analyzeMessage(text: string): MessageAnalysis {
  const input = text.trim();
  const words = input ? input.split(/\s+/).filter(Boolean).length : 0;

  const signals: MessageSignal[] = [];
  const categories: string[] = [];
  const actions: string[] = [];
  let score = 0;

  for (const rule of RULES) {
    if (!rule.pattern.test(input)) continue;
    signals.push({
      label: rule.label,
      detail: rule.detail,
      severity: rule.severity,
    });
    score += rule.weight;
    if (rule.category && !categories.includes(rule.category)) {
      categories.push(rule.category);
    }
    if (rule.action && !actions.includes(rule.action)) actions.push(rule.action);
  }

  const rawLinks = extractLinks(input);
  const links = rawLinks.map((link) => analyzeUrl(link));
  const worstLink = links.reduce<UrlAnalysis | null>(
    (worst, link) => (!worst || link.score > worst.score ? link : worst),
    null,
  );

  if (worstLink) {
    score += Math.round(worstLink.score * 0.45);
    signals.push({
      label:
        worstLink.verdict === "dangerous"
          ? "Dangerous link inside the message"
          : worstLink.verdict === "suspicious"
            ? "Link shows phishing patterns"
            : "Link present in the message",
      detail: `${worstLink.hostname} — ${worstLink.reason}`,
      severity:
        worstLink.verdict === "dangerous"
          ? "high"
          : worstLink.verdict === "suspicious"
            ? "medium"
            : "low",
    });
    if (worstLink.verdict === "dangerous" && !categories.includes("Phishing link")) {
      categories.unshift("Phishing link");
    }
  }

  // Links with their own risk findings deserve their own explanation.
  links
    .filter((link) => link.verdict !== "safe")
    .flatMap((link) => link.findings)
    .filter((finding) => finding.severity === "high")
    .slice(0, 2)
    .forEach((finding) => {
      const label = finding.label;
      if (!signals.some((signal) => signal.label === label)) {
        signals.push({
          label,
          detail: finding.detail,
          severity: "medium",
        });
      }
    });

  // A message that is only a dangerous link should read as high risk, not as a
  // weak signal just because there is no surrounding text to score.
  const linkOnly = links.length === 1 && input.split(/\s+/).filter(Boolean).length <= 2;
  if (linkOnly && worstLink?.verdict === "dangerous") {
    score = Math.max(score, 70);
  }

  score = Math.min(99, score);

  const verdict: Verdict =
    score >= 55 ? "dangerous" : score >= 25 ? "suspicious" : "safe";

  const label =
    verdict === "dangerous"
      ? "High risk"
      : verdict === "suspicious"
        ? "Looks suspicious"
        : "No strong scam signals";

  const category =
    categories[0] ??
    (verdict === "safe" ? "Nothing recognised" : "Unclassified scam pattern");

  if (signals.length === 0) {
    signals.push({
      label: "No known scam patterns found",
      detail:
        "Nothing in this text matches the scam patterns ScamShield checks for. That is not a guarantee — a new scam can look ordinary.",
      severity: "low",
    });
  }

  for (const action of CORE_ACTIONS) {
    if (!actions.includes(action)) actions.push(action);
  }
  if (verdict !== "safe") actions.push(REPORT_ACTION);

  const topSignals = signals
    .filter((signal) => signal.severity === "high")
    .slice(0, 2)
    .map((signal) => signal.label.toLowerCase());
  const summary =
    verdict === "dangerous"
      ? `This reads like a ${category.toLowerCase()} attempt${
          topSignals.length ? ` — it uses ${topSignals.join(" and ")}.` : "."
        } Do not reply, tap or pay.`
      : verdict === "suspicious"
        ? `Some parts of this message match known scam patterns${
            topSignals.length ? `, including ${topSignals.join(" and ")}` : ""
          }. Verify the sender independently before you act.`
        : "Nothing here matches the common scam patterns we check. Stay careful with links and never share an OTP.";

  return {
    score,
    verdict,
    label,
    category,
    summary,
    signals: signals.slice(0, 8),
    links,
    actions: actions.slice(0, 4),
    words,
  };
}
