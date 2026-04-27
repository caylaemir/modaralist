import "server-only";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { db } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

/**
 * SelooAI — Modaralist musteri asistani.
 * gpt-4o-mini + tool use ile DB'den canli urun/stok/kargo bilgisi ceker.
 */

let _client: OpenAI | null = null;
function getClient() {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  _client = new OpenAI({ apiKey: key });
  return _client;
}

const MAX_ITERATIONS = 5; // Tool use loop guvenligi
const MAX_RESULTS_PER_TOOL = 8; // Token tasarrufu

// ============================================================
//  TOOL DEFINITIONS — OpenAI'a hangi fonksiyonlari sunuyoruz
// ============================================================

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Modaralist mağazasında ürün arar. Kategori, beden, renk, fiyat aralığına göre filtreler. Müşteri 'M bedeni tişört var mı', 'siyah sweat ne kadar', '500 TL altı outdoor parça' gibi sorularda kullanılır.",
      parameters: {
        type: "object",
        properties: {
          categorySlug: {
            type: "string",
            description: "Kategori slug: tshirt, sweatshirt, oversize, outdoor, polar, esofman, sort. Opsiyonel.",
          },
          sizeCode: {
            type: "string",
            description: "Beden kodu (XS, S, M, L, XL, XXL veya numerik 38, 40 vs). Opsiyonel.",
          },
          colorName: {
            type: "string",
            description: "Renk adı Türkçe (Krem, Kil, Siyah, Kum, Lacivert vs). Opsiyonel.",
          },
          minPrice: { type: "number", description: "Min fiyat TL" },
          maxPrice: { type: "number", description: "Max fiyat TL" },
          inStockOnly: {
            type: "boolean",
            description: "Sadece stoğu olan ürünler (default true)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description: "Belirli bir ürünün tam detaylarını getirir (slug ile). Fiyat, açıklama, mevcut bedenler+renkler, stok durumu.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Ürün slug (örn: oversize-krem-tisort)" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Tüm aktif kategorileri ve her birindeki ürün sayısını listeler.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_shipping_info",
      description: "Kargo bilgilerini döner: standart kargo ücreti, hızlı kargo ücreti, ücretsiz kargo eşiği, teslimat süresi.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_bundle_discount",
      description: "Sepet paket indirimi (bundle) bilgisi: aktif mi, min sepet tutarı, 2 ürün ve 3+ ürün indirim oranları.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_return_and_legal",
      description: "İade politikası, KVKK ve teslimat süreleri hakkında genel bilgi.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ============================================================
//  TOOL EXECUTORS — DB'yi sorgulayip JSON-friendly veri donerler
// ============================================================

type ToolArgs = Record<string, unknown>;

async function searchProducts(args: ToolArgs) {
  const categorySlug = args.categorySlug as string | undefined;
  const sizeCode = args.sizeCode as string | undefined;
  const colorName = args.colorName as string | undefined;
  const minPrice = args.minPrice as number | undefined;
  const maxPrice = args.maxPrice as number | undefined;
  const inStockOnly = (args.inStockOnly ?? true) as boolean;

  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(minPrice != null ? { basePrice: { gte: minPrice } } : {}),
      ...(maxPrice != null ? { basePrice: { lte: maxPrice } } : {}),
      ...(sizeCode || colorName
        ? {
            variants: {
              some: {
                isActive: true,
                ...(inStockOnly ? { stock: { gt: 0 } } : {}),
                ...(sizeCode
                  ? { size: { code: sizeCode.toUpperCase() } }
                  : {}),
                ...(colorName
                  ? {
                      color: {
                        OR: [
                          { nameTr: { contains: colorName, mode: "insensitive" } },
                          { nameEn: { contains: colorName, mode: "insensitive" } },
                        ],
                      },
                    }
                  : {}),
              },
            },
          }
        : {}),
    },
    take: MAX_RESULTS_PER_TOOL,
    include: {
      translations: { where: { locale: "tr" } },
      variants: {
        where: { isActive: true },
        include: { size: true, color: true },
      },
      category: { include: { translations: { where: { locale: "tr" } } } },
    },
  });

  return products.map((p) => {
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    const sizes = Array.from(
      new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size?.code))
    ).filter(Boolean);
    const colors = Array.from(
      new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.color?.nameTr))
    ).filter(Boolean);
    return {
      slug: p.slug,
      name: p.translations[0]?.name ?? p.slug,
      category: p.category?.translations[0]?.name ?? null,
      price: Number(p.basePrice),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      url: `https://modaralist.shop/tr/products/${p.slug}`,
      stockTotal: totalStock,
      availableSizes: sizes,
      availableColors: colors,
    };
  });
}

async function getProductDetails(args: ToolArgs) {
  const slug = args.slug as string;
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: "tr" } },
      variants: {
        where: { isActive: true },
        include: { size: true, color: true },
      },
      category: { include: { translations: { where: { locale: "tr" } } } },
    },
  });
  if (!p) return { error: "Ürün bulunamadı" };

  const tr = p.translations[0];
  return {
    slug: p.slug,
    name: tr?.name ?? p.slug,
    description: tr?.description ?? null,
    material: tr?.material ?? null,
    care: tr?.care ?? null,
    category: p.category?.translations[0]?.name ?? null,
    price: Number(p.basePrice),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    url: `https://modaralist.shop/tr/products/${p.slug}`,
    variants: p.variants.map((v) => ({
      size: v.size?.code ?? null,
      color: v.color?.nameTr ?? null,
      stock: v.stock,
    })),
  };
}

async function getCategories() {
  const cats = await db.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      translations: { where: { locale: "tr" } },
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
    },
  });
  return cats.map((c) => ({
    slug: c.slug,
    name: c.translations[0]?.name ?? c.slug,
    productCount: c._count.products,
    url: `https://modaralist.shop/tr/shop/${c.slug}`,
  }));
}

async function getShippingInfo() {
  const s = await getAllSettings();
  const standard = Number(s["shop.shippingStandard"] ?? 0);
  const express = Number(s["shop.shippingExpress"] ?? 89);
  const freeOver = Number(s["shop.freeShippingOver"] ?? 0);
  return {
    standardCost: standard === 0 ? "Ücretsiz" : formatPrice(standard, "tr"),
    standardDeliveryDays: "1-2 iş günü (Marmara), 2-4 iş günü (diğer iller)",
    expressCost: formatPrice(express, "tr"),
    expressDeliveryDays: "Ertesi iş günü teslim",
    freeShippingThreshold:
      freeOver > 0
        ? `${formatPrice(freeOver, "tr")} ve üstü standart kargo ücretsiz`
        : "Eşik yok",
  };
}

async function getBundleDiscount() {
  const s = await getAllSettings();
  if (s["bundle.enabled"] !== "true") {
    return { active: false };
  }
  return {
    active: true,
    minSubtotal: formatPrice(Number(s["bundle.minSubtotal"] ?? 0), "tr"),
    tier2Discount: `${s["bundle.tier2Discount"]}% (2 ürün)`,
    tier3Discount: `${s["bundle.tier3Discount"]}% (3+ ürün)`,
    note: "İndirim sepetteki en ucuz ürüne uygulanır",
  };
}

function getReturnAndLegal() {
  return {
    returnWindowDays: 14,
    returnConditions: "Etiketleri sökülmemiş, denenmiş ama giyilmemiş ürünler",
    returnShippingCost: "Modaralist karşılar",
    refundTimeline: "5-10 iş günü içinde aynı kart/hesaba",
    paymentMethods: ["Visa", "Mastercard", "American Express"],
    paymentSecurity: "iyzico ile şifrelenir, kart bilgileri sunucuda saklanmaz",
    kvkkPage: "https://modaralist.shop/tr/pages/kvkk",
    distanceSalesPage: "https://modaralist.shop/tr/pages/distance-sales",
  };
}

async function executeTool(name: string, args: ToolArgs): Promise<unknown> {
  switch (name) {
    case "search_products":
      return searchProducts(args);
    case "get_product_details":
      return getProductDetails(args);
    case "get_categories":
      return getCategories();
    case "get_shipping_info":
      return getShippingInfo();
    case "get_bundle_discount":
      return getBundleDiscount();
    case "get_return_and_legal":
      return getReturnAndLegal();
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ============================================================
//  CHAT — main entry, tool use loop
// ============================================================

const SYSTEM_PROMPT = `Sen "SelooAI"sın — Modaralist'in resmi müşteri asistanı.

KIMLIK:
- Adın Seloo
- Modaralist Marmara bölgesi odaklı premium streetwear/casual giyim e-ticaret markası
- 7 kategori: Tshirt, Sweatshirt, Oversize, Outdoor, Polar, Eşofman, Şort

KURALLAR:
- HER ZAMAN Türkçe konuş (müşteri English sorarsa English cevap ver)
- Samimi ama profesyonel ton (genç-orta yaş hedef kitle)
- Emoji kullanma (markamız sade)
- Sadece Modaralist hakkında konuş, dışarıya çıkma (başka markaları önerme, kişisel tavsiyeden kaçın)
- Ürün önerirken MUTLAKA tools kullan, hayal ürünü uydurmá
- Stok bilgisi ver: "M bedeni stokta var" / "Şu an XL kalmamış, S/M/L mevcut"
- Fiyat verirken indirimli + normal fiyatı söyle (varsa)
- Linkler ver: "Şu ürüne bakabilirsin: [url]"
- Kargo/iade soruları → tools'tan al, tahminde bulunma
- Bilmediğin bir şey sorulursa: "Bu konuda yardımcı olamam, /pages/contact üzerinden ekibimize yazabilirsin"

ÖRNEKLER:
- "36 bedenim, tişört önerir misin" → search_products(categorySlug:"tshirt", sizeCode:"S") çağır, sonuçları say + link
- "Kargo bedava mı" → get_shipping_info çağır, eşiği söyle
- "Siyah sweat var mı" → search_products(categorySlug:"sweatshirt", colorName:"Siyah") çağır

NOT: 36 beden = XS/S, 38-40 = M, 42-44 = L, 46-48 = XL gibi pratik dönüşümler yap. Numerik sorulursa söyle. Müşteri tişört bedeni soruyorsa giyinme bedeni varsay (S/M/L), pantolon/şort numerasyonu sorarsa numerik (38/40 vs.).`;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResult =
  | { ok: true; reply: string; usage?: { input: number; output: number } }
  | { ok: false; error: string };

export async function chat(messages: ChatMessage[]): Promise<ChatResult> {
  const client = getClient();
  if (!client) return { ok: false, error: "AI servis yapılandırılmadı" };

  // Convert to OpenAI format + add system prompt
  const conversation: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let totalInput = 0;
  let totalOutput = 0;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let response;
    try {
      response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversation,
        tools,
        max_tokens: 800,
      });
    } catch (err) {
      if (err instanceof OpenAI.RateLimitError) {
        return { ok: false, error: "Çok yoğun, birazdan tekrar dene" };
      }
      console.error("[seloo]", err);
      return { ok: false, error: "Bir sorun oluştu" };
    }

    totalInput += response.usage?.prompt_tokens ?? 0;
    totalOutput += response.usage?.completion_tokens ?? 0;

    const msg = response.choices[0]?.message;
    if (!msg) return { ok: false, error: "Boş yanıt" };

    // Tool calls var mi?
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      conversation.push(msg);
      for (const call of msg.tool_calls) {
        if (call.type !== "function") continue;
        let args: ToolArgs = {};
        try {
          args = JSON.parse(call.function.arguments) as ToolArgs;
        } catch {
          // ignore parse error, send empty
        }
        const result = await executeTool(call.function.name, args);
        conversation.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      continue; // Loop back to model
    }

    // Final text yaniti
    return {
      ok: true,
      reply: msg.content ?? "",
      usage: { input: totalInput, output: totalOutput },
    };
  }

  return { ok: false, error: "İşlem çok uzun sürdü" };
}
