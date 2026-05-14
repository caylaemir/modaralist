import "server-only";
import crypto from "node:crypto";

const PAYTR_TOKEN_ENDPOINT = "https://www.paytr.com/odeme/api/get-token";
const PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli";

type PaytrConfig = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: "0" | "1";
  debugOn: "0" | "1";
  noInstallment: "0" | "1";
  maxInstallment: string;
  iframeV2: "0" | "1";
  iframeV2Dark: "0" | "1";
};

export type PaytrBasketItem = {
  name: string;
  unitPrice: number;
  quantity: number;
};

export type PaytrPaymentInput = {
  orderNumber: string;
  totalPrice: number;
  email: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  userIp: string;
  okUrl: string;
  failUrl: string;
  locale: "tr" | "en";
  items: PaytrBasketItem[];
};

type PaytrTokenResponse =
  | { status: "success"; token: string }
  | { status: "failed"; reason: string };

export type PaytrCallbackPayload = {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
};

function getConfig(): PaytrConfig {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error("PAYTR_CONFIG_MISSING");
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode: process.env.PAYTR_TEST_MODE === "1" ? "1" : "0",
    debugOn:
      process.env.PAYTR_DEBUG_ON === "0" && process.env.NODE_ENV === "production"
        ? "0"
        : "1",
    noInstallment: process.env.PAYTR_NO_INSTALLMENT === "1" ? "1" : "0",
    maxInstallment: process.env.PAYTR_MAX_INSTALLMENT || "0",
    iframeV2: process.env.PAYTR_IFRAME_V2 === "0" ? "0" : "1",
    iframeV2Dark: process.env.PAYTR_IFRAME_V2_DARK === "1" ? "1" : "0",
  };
}

function createPaytrToken(hashString: string, config: PaytrConfig) {
  return crypto
    .createHmac("sha256", config.merchantKey)
    .update(hashString + config.merchantSalt)
    .digest("base64");
}

function createPaytrCallbackHash(payload: PaytrCallbackPayload, config: PaytrConfig) {
  return crypto
    .createHmac("sha256", config.merchantKey)
    .update(
      payload.merchantOid +
        config.merchantSalt +
        payload.status +
        payload.totalAmount
    )
    .digest("base64");
}

function toKurus(amount: number) {
  return String(Math.max(1, Math.round(amount * 100)));
}

function createBasket(items: PaytrBasketItem[]) {
  const basket = items.map((item) => [
    item.name,
    item.unitPrice.toFixed(2),
    item.quantity,
  ]);
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}

function safeJson(value: string): PaytrTokenResponse {
  try {
    return JSON.parse(value) as PaytrTokenResponse;
  } catch {
    return { status: "failed", reason: "PAYTR yaniti okunamadi" };
  }
}

export async function initiatePaytrPayment(input: PaytrPaymentInput) {
  const config = getConfig();
  const paymentAmount = toKurus(input.totalPrice);
  const userBasket = createBasket(input.items);
  const lang = input.locale === "en" ? "en" : "tr";

  const hashString =
    config.merchantId +
    input.userIp +
    input.orderNumber +
    input.email +
    paymentAmount +
    userBasket +
    config.noInstallment +
    config.maxInstallment +
    "TL" +
    config.testMode;

  const paytrToken = createPaytrToken(hashString, config);

  const form = new URLSearchParams({
    merchant_id: config.merchantId,
    user_ip: input.userIp,
    merchant_oid: input.orderNumber,
    email: input.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: config.debugOn,
    no_installment: config.noInstallment,
    max_installment: config.maxInstallment,
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    merchant_ok_url: input.okUrl,
    merchant_fail_url: input.failUrl,
    timeout_limit: process.env.PAYTR_TIMEOUT_LIMIT || "30",
    currency: "TL",
    test_mode: config.testMode,
    lang,
    iframe_v2: config.iframeV2,
    iframe_v2_dark: config.iframeV2Dark,
  });

  const response = await fetch(PAYTR_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
  });

  const result = safeJson(await response.text());
  if (!response.ok || result.status !== "success") {
    const reason =
      result.status === "failed" ? result.reason : "PAYTR token alinamadi";
    throw new Error(reason);
  }

  return {
    token: result.token,
    iframeUrl: `${PAYTR_IFRAME_BASE}/${result.token}`,
    paymentAmount,
    testMode: config.testMode === "1",
  };
}

export function verifyPaytrCallback(payload: PaytrCallbackPayload) {
  const config = getConfig();
  const token = createPaytrCallbackHash(payload, config);
  const expected = Buffer.from(token);
  const received = Buffer.from(payload.hash);

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}
