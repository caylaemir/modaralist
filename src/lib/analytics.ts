// E-ticaret event'leri (GA4 + Meta Pixel + TikTok Pixel)
// Cookie consent verildiğinde tetiklenir.
// Pixel ID'leri yoksa hiçbir şey atılmaz (fallback).

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (event: string, props?: Record<string, unknown>) => void };
};

function gtag(...args: unknown[]) {
  const w = window as unknown as GtagWindow;
  if (typeof w.gtag === "function") w.gtag(...args);
}

function fbq(...args: unknown[]) {
  const w = window as unknown as GtagWindow;
  if (typeof w.fbq === "function") w.fbq(...args);
}

function ttq(event: string, props?: Record<string, unknown>) {
  const w = window as unknown as GtagWindow;
  if (w.ttq && typeof w.ttq.track === "function") w.ttq.track(event, props);
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  currency?: string;
};

/** Ürün detayı görüntüleme */
export function trackViewItem(item: AnalyticsItem) {
  if (typeof window === "undefined") return;
  gtag("event", "view_item", {
    currency: item.currency ?? "TRY",
    value: item.price,
    items: [item],
  });
  fbq("track", "ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price,
    currency: item.currency ?? "TRY",
  });
  ttq("ViewContent", {
    contents: [{ content_id: item.item_id, content_name: item.item_name, price: item.price }],
    value: item.price,
    currency: item.currency ?? "TRY",
  });
}

/** Sepete ekleme */
export function trackAddToCart(item: AnalyticsItem) {
  if (typeof window === "undefined") return;
  const value = item.price * (item.quantity ?? 1);
  gtag("event", "add_to_cart", {
    currency: item.currency ?? "TRY",
    value,
    items: [item],
  });
  fbq("track", "AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    value,
    currency: item.currency ?? "TRY",
  });
  ttq("AddToCart", {
    contents: [{ content_id: item.item_id, content_name: item.item_name, price: item.price, quantity: item.quantity ?? 1 }],
    value,
    currency: item.currency ?? "TRY",
  });
}

/** Checkout başlangıcı */
export function trackBeginCheckout(items: AnalyticsItem[], total: number) {
  if (typeof window === "undefined") return;
  gtag("event", "begin_checkout", {
    currency: "TRY",
    value: total,
    items,
  });
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    value: total,
    currency: "TRY",
  });
  ttq("InitiateCheckout", {
    contents: items.map((i) => ({ content_id: i.item_id, content_name: i.item_name, price: i.price })),
    value: total,
    currency: "TRY",
  });
}

/** Sipariş tamamlandı */
export function trackPurchase(args: {
  orderNumber: string;
  total: number;
  items: AnalyticsItem[];
  currency?: string;
}) {
  if (typeof window === "undefined") return;
  const currency = args.currency ?? "TRY";
  gtag("event", "purchase", {
    transaction_id: args.orderNumber,
    value: args.total,
    currency,
    items: args.items,
  });
  fbq("track", "Purchase", {
    content_ids: args.items.map((i) => i.item_id),
    value: args.total,
    currency,
  });
  ttq("Purchase", {
    contents: args.items.map((i) => ({ content_id: i.item_id, content_name: i.item_name, price: i.price })),
    value: args.total,
    currency,
  });
}

/** Newsletter abonelik */
export function trackSubscribe(email: string) {
  if (typeof window === "undefined") return;
  gtag("event", "sign_up", { method: "newsletter" });
  fbq("track", "Subscribe", { email });
  ttq("Subscribe");
}

/** Search */
export function trackSearch(query: string) {
  if (typeof window === "undefined") return;
  gtag("event", "search", { search_term: query });
  fbq("track", "Search", { search_string: query });
  ttq("Search", { query });
}
