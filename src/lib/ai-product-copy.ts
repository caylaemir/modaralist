import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

/**
 * GPT-4o-mini ile urun copy uretir (TR/EN aciklama + materyal + bakim + SEO).
 * Admin "AI ile doldur" butonu cagirir.
 *
 * Model: gpt-4o-mini ($0.15/$0.60 per 1M token — Claude Opus'tan ~30x ucuz)
 * Output: structured outputs ile zod schema garantili
 * "server-only" import: bu dosya client bundle'a SIZAMAZ
 */

let _client: OpenAI | null = null;
function getClient() {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  _client = new OpenAI({ apiKey: key });
  return _client;
}

const CopySchema = z.object({
  trDescription: z
    .string()
    .describe("Türkçe ürün açıklaması, 2-3 cümle, satış odaklı, sezonsuz"),
  enDescription: z
    .string()
    .describe("English product description, 2-3 sentences, sales-driven"),
  trMaterial: z.string().describe("Türkçe materyal/kumaş bilgisi, kısa"),
  enMaterial: z.string().describe("English material/fabric info, brief"),
  trCare: z.string().describe("Türkçe bakım talimatı, tek satır (yıkama vs.)"),
  enCare: z.string().describe("English care instruction, single line"),
  trSeoTitle: z
    .string()
    .describe("Türkçe SEO başlığı, max 60 karakter, marka adı dahil"),
  trSeoDesc: z
    .string()
    .describe("Türkçe SEO meta açıklama, max 155 karakter"),
  enSeoTitle: z.string().describe("English SEO title, max 60 chars"),
  enSeoDesc: z.string().describe("English SEO meta description, max 155 chars"),
});

export type GeneratedProductCopy = z.infer<typeof CopySchema>;

export async function generateProductCopy(input: {
  productName: string;
  categoryName?: string;
  styleHints?: string;
}): Promise<GeneratedProductCopy | { error: string }> {
  const client = getClient();
  if (!client) {
    return { error: "OPENAI_API_KEY tanimli degil" };
  }

  const systemPrompt = `Sen Modaralist adlı premium streetwear/casual giyim e-ticaret markası için ürün copy yazıyorsun. Marka tonu:
- Sade, modern, hafif lüks (cream/black estetik)
- Marmara bölgesi (İstanbul, Bursa, Kocaeli) odaklı
- Numaralı, sınırlı üretim drop'lar
- "Sezonsuz silüet", "premium dokular", "modern siluetler" gibi temalar

KURALLAR:
- TR ve EN aynı bilgiyi vermeli ama her dilde doğal
- Açıklamalar satış odaklı ama abartılı değil
- SEO başlık 60 karakter limit (marka adı + kategori + temel özellik)
- SEO desc 155 karakter limit, fayda + CTA içersin
- Türkçe karakterleri (ç, ğ, ı, ş, ö, ü) doğru kullan`;

  const userPrompt = [
    `Ürün adı: ${input.productName}`,
    input.categoryName ? `Kategori: ${input.categoryName}` : null,
    input.styleHints ? `Stil/özellik notları: ${input.styleHints}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const completion = await client.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(CopySchema, "product_copy"),
      max_tokens: 2000,
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) {
      return { error: "Parse basarisiz" };
    }
    return parsed;
  } catch (err) {
    if (err instanceof OpenAI.RateLimitError) {
      return { error: "Rate limit — birazdan tekrar dene" };
    }
    if (err instanceof OpenAI.APIError) {
      console.error("[ai-copy] API error", err.status, err.message);
      return { error: `API hata (${err.status})` };
    }
    console.error("[ai-copy]", err);
    return { error: "Bilinmeyen hata" };
  }
}
