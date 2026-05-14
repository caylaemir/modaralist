/**
 * Basit cookie-tabanli A/B test atayici (client-side).
 *
 * - Cookie onayi yoksa varsayilan A varyanti kullanilir.
 * - Onay varsa sticky: ayni kullanici hep ayni varianti gorur (cookie 30 gun)
 * - Onay varsa %50/%50 atama (Math.random)
 * - GA4 'experiment_view' event'i firlatir (admin GA4'te
 *   variant'a gore conversion karsilastirabilir)
 *
 * Kullanim:
 *   const variant = getOrAssignVariant("free-shipping");
 *   if (variant === "B") { ... }
 */

const COOKIE_PREFIX = "mdr-ab-";
const COOKIE_DAYS = 30;
const COOKIE_CONSENT_KEY = "modaralist-cookies";

export type Variant = "A" | "B";

function hasExperimentConsent() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "all";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function clearExperimentCookies() {
  if (typeof document === "undefined") return;
  document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name.startsWith(COOKIE_PREFIX))
    .forEach(deleteCookie);
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + days * 86400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}

export function getOrAssignVariant(experimentName: string): Variant {
  const cookieName = COOKIE_PREFIX + experimentName;

  if (!hasExperimentConsent()) {
    deleteCookie(cookieName);
    return "A";
  }

  const existing = getCookie(cookieName);
  if (existing === "A" || existing === "B") return existing;

  const v: Variant = Math.random() < 0.5 ? "A" : "B";
  setCookie(cookieName, v, COOKIE_DAYS);

  // GA4'e atama event'i (cookie banner'a uyumlu, gtag yoksa sessizce drop)
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", "experiment_view", {
        experiment_id: experimentName,
        variant_id: v,
      });
    }
  }

  return v;
}
