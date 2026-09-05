import type { Lang } from "./types";

// Supabase returns plain English error strings from GoTrue. We match on the
// stable substrings it actually sends and re-map them to something clean and
// localized, instead of surfacing raw SDK text to the user.
const RULES: { match: RegExp; en: string; tr: string }[] = [
  {
    match: /invalid login credentials/i,
    en: "That email or password isn't right.",
    tr: "E-posta veya şifre hatalı.",
  },
  {
    match: /email not confirmed/i,
    en: "Confirm your email first — check your inbox for the link.",
    tr: "E-postanı henüz onaylamamışsın — gelen kutunda onay linkine bak.",
  },
  {
    match: /user already registered|already been registered/i,
    en: "An account with this email already exists. Try signing in instead.",
    tr: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.",
  },
  {
    match: /password should be at least (\d+) characters/i,
    en: "Password needs to be at least 6 characters.",
    tr: "Şifre en az 6 karakter olmalı.",
  },
  {
    match: /unable to validate email address|invalid email/i,
    en: "That email address doesn't look valid.",
    tr: "Bu e-posta adresi geçerli görünmüyor.",
  },
  {
    match: /signup requires a valid password/i,
    en: "Enter a password to create your account.",
    tr: "Hesap oluşturmak için bir şifre gir.",
  },
  {
    match: /rate limit|too many requests|for security purposes/i,
    en: "Too many attempts — wait a moment and try again.",
    tr: "Çok fazla deneme yaptın, biraz bekleyip tekrar dene.",
  },
  {
    match: /network|fetch failed|failed to fetch/i,
    en: "Couldn't reach the server. Check your connection and try again.",
    tr: "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.",
  },
  {
    match: /user not found/i,
    en: "No account found with that email.",
    tr: "Bu e-postayla kayıtlı bir hesap bulunamadı.",
  },
  {
    match: /cloud sync not configured/i,
    en: "Cloud sync isn't set up for this deployment yet.",
    tr: "Bu kurulumda cloud sync henüz yapılandırılmamış.",
  },
];

const FALLBACK = {
  en: "Something went wrong. Try again in a moment.",
  tr: "Bir şeyler ters gitti. Birazdan tekrar dene.",
};

export function translateAuthError(raw: string | null | undefined, lang: Lang): string {
  if (!raw) return FALLBACK[lang];
  const hit = RULES.find((r) => r.match.test(raw));
  return hit ? hit[lang] : FALLBACK[lang];
}
