import jsQR from "jsqr";

export type Verdict = "dangerous" | "suspicious" | "safe";

export interface Finding {
  label: string;
  detail: string;
  severity: "high" | "medium" | "low" | "ok";
}

export interface UrlAnalysis {
  url: string;
  hostname: string;
  verdict: Verdict;
  score: number;
  reason: string;
  findings: Finding[];
}

const RISKY_TLDS = [
  "top", "xyz", "live", "shop", "site", "online", "club", "cc", "apk", "link",
  "store", "icu", "rest", "click", "zip", "mov", "buzz", "cyou", "sbs", "lol",
];

const BRAND_TERMS = [
  "kyc", "verify", "login", "secure", "account", "update", "upi", "refund",
  "wallet", "bank", "paytm", "sbi", "hdfc", "icici", "axis", "amazon", "netflix",
  "paypal", "parcel", "delivery", "lottery", "prize", "cashback", "reward",
];

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "rb.gy", "is.gd", "cutt.ly", "shorturl.at"];

const isIp = (host: string) =>
  /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");

export function analyzeUrl(raw: string): UrlAnalysis {
  const trimmed = raw.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || /^upi:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return {
      url: trimmed,
      hostname: trimmed.slice(0, 46),
      verdict: "suspicious",
      score: 52,
      reason: "This payload could not be parsed as a standard web address.",
      findings: [
        {
          label: "Unparseable payload",
          detail: "The QR contents are not a valid URL. Treat unknown payloads with caution.",
          severity: "medium",
        },
      ],
    };
  }

  const findings: Finding[] = [];
  let score = 0;
  const hostname = parsed.hostname.toLowerCase();

  if (parsed.protocol === "upi:") {
    return {
      url: trimmed,
      hostname: "UPI payment request",
      verdict: "suspicious",
      score: 58,
      reason:
        "This QR code initiates a payment request. Confirm the payee name inside your UPI app before approving — never approve a collect request you did not initiate.",
      findings: [
        {
          label: "Payment request QR",
          detail: "This can move money immediately once approved.",
          severity: "high",
        },
        {
          label: "Payee not independently verified",
          detail: "ScamShield cannot validate the merchant behind this handle.",
          severity: "medium",
        },
      ],
    };
  }

  if (parsed.protocol === "http:") {
    score += 18;
    findings.push({
      label: "No transport encryption",
      detail: "The link uses http:// so anything you submit can be read in transit.",
      severity: "medium",
    });
  }

  if (trimmed.includes("@")) {
    score += 22;
    findings.push({
      label: "Embedded credentials",
      detail: "An @ in the URL can disguise the real destination host.",
      severity: "high",
    });
  }

  if (isIp(hostname)) {
    score += 30;
    findings.push({
      label: "Raw IP address host",
      detail: "Legitimate consumer services rarely host login pages on a bare IP.",
      severity: "high",
    });
  }

  const tld = hostname.split(".").pop() ?? "";
  if (RISKY_TLDS.includes(tld)) {
    score += 24;
    findings.push({
      label: `High-abuse TLD .${tld}`,
      detail: "This top-level domain is disproportionately used for disposable scam pages.",
      severity: "high",
    });
  }

  if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
    score += 26;
    findings.push({
      label: "Punycode / homoglyph host",
      detail: "The address uses encoded characters that can imitate a known brand.",
      severity: "high",
    });
  }

  const matchedBrands = BRAND_TERMS.filter((term) => hostname.includes(term));
  if (matchedBrands.length > 0) {
    score += Math.min(22, matchedBrands.length * 8);
    findings.push({
      label: "Brand / urgency keywords",
      detail: `Host contains ${matchedBrands.slice(0, 4).join(", ")} — common in credential lures.`,
      severity: "medium",
    });
  }

  const labels = hostname.split(".");
  if (labels.length >= 4) {
    score += 14;
    findings.push({
      label: "Excessive subdomains",
      detail: `${labels.length - 2} subdomain levels are often used to bury the real domain.`,
      severity: "medium",
    });
  }

  if (hostname.length > 34) {
    score += 10;
    findings.push({
      label: "Unusually long hostname",
      detail: "Long hosts are used to push the real domain out of view on mobile.",
      severity: "low",
    });
  }

  if ((hostname.match(/-/g) ?? []).length >= 3) {
    score += 10;
    findings.push({
      label: "Hyphen-stuffed host",
      detail: "Multiple hyphens commonly appear in lookalike domains.",
      severity: "low",
    });
  }

  if (SHORTENERS.includes(hostname.replace(/^www\./, ""))) {
    score += 18;
    findings.push({
      label: "Link shortener",
      detail: "The final destination is hidden until the short link is resolved.",
      severity: "medium",
    });
  }

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) === false && labels.length === 2) {
    findings.push({
      label: "Registrable domain",
      detail: hostname,
      severity: "ok",
    });
  }

  const verdict: Verdict = score >= 55 ? "dangerous" : score >= 25 ? "suspicious" : "safe";
  const reason =
    verdict === "dangerous"
      ? "This link matches patterns strongly associated with phishing and credential theft."
      : verdict === "suspicious"
        ? "This link shows risk indicators. Do not enter credentials or payment details until you verify the sender."
        : "No high-risk indicators were found for this address. Stay alert — new scam domains appear constantly.";

  if (verdict === "safe" && findings.length === 0) {
    findings.push({
      label: "No known risk pattern",
      detail: "Checked against URL structure and high-abuse hosting patterns on this device.",
      severity: "ok",
    });
  }

  return {
    url: parsed.toString(),
    hostname,
    verdict,
    score: Math.min(99, score),
    reason,
    findings,
  };
}

export function decodeImageData(data: ImageData): string | null {
  const result = jsQR(data.data, data.width, data.height, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data ?? null;
}

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return decodeImageData(imageData);
  } finally {
    // Release the decoded bitmap even when the canvas is unavailable.
    bitmap.close();
  }
}
