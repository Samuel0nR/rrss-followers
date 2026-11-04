const USERNAME_PATTERN = /^[a-z0-9._]{1,30}$/i;
const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF]/g;

export function usernameFromUrl(href: string): string | undefined {
  try {
    const url = new URL(href);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return undefined;
    const segments = url.pathname.split("/").filter(Boolean);
    const candidate = segments[0]?.toLowerCase() === "_u" ? segments[1] : segments[0];
    return candidate ? decodeURIComponent(candidate) : undefined;
  } catch {
    return undefined;
  }
}

export function cleanUsername(raw: string): string | undefined {
  let username = raw.normalize("NFKC").trim();
  if (/^https?:\/\//i.test(username)) username = usernameFromUrl(username) ?? "";
  username = username
    .replace(/^@+/, "")
    .replace(INVISIBLE_CHARS, "")
    .replace(/\/+$/, "")
    .trim();
  return username || undefined;
}

export function usernameKey(raw: string): string | undefined {
  return cleanUsername(raw)?.toLowerCase();
}

export function looksLikeUsername(raw: string): boolean {
  return USERNAME_PATTERN.test(raw.trim());
}
