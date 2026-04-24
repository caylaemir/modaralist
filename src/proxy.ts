import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16: "middleware" → "proxy" rename (aynı davranış).
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
