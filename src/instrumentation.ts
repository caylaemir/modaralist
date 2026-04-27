/**
 * Next.js instrumentation hook — sunucu/edge runtime baslarken cagrilir.
 * Sentry SDK 8+ icin gerekli (sentry.server/edge.config.ts otomatik
 * yuklenmez, buradan dinamik import ediyoruz).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  err: unknown,
  req: { path: string; method: string; headers: Record<string, string> },
  ctx: { routerKind: string; routePath: string; routeType: string }
) {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(err, req, ctx);
  }
}
