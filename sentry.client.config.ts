import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sadece DSN set ise init et (dev'de loglarla bos calismasin)
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Performance monitoring — production'da %10 sample (cost kontrolu)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Browser session replay — sadece hatali oturumlarda
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    // PII gondermeyi kapat (KVKK)
    sendDefaultPii: false,
  });
}
