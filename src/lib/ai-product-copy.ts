import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

/**
 * Claude AI ile urun copy (TR/EN aciklama + materyal + bakim + SEO)
 * tek seferlik uretir. Admin "AI ile doldur" butonu cagirir.
 *
 * Model: claude-opus-4-7 (en kaliteli copy)
 * Output: zodOutputFormat ile struktur garantili JSON (parse hatasi olmaz)
 * Thinking: disabled (kisa structured output icin overhead)
 * Effort: low (basit task, hiz + ucuzluk)
 */

let _client: Anthropic | null = null;
function getClient() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
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
    .max(70)
    .describe("Türkçe SEO başlığı, max 60 karakter, marka adı dahil"),
  trSeoDesc: z
    .string()
    .max(160)
    .describe("Türkçe SEO meta açıklama, max 155 karakter, satış cümlesi"),
  enSeoTitle: z
    .string()
    .max(70)
    .describe("English SEO title, max 60 chars, brand included"),
  enSeoDesc: z
    .string()
    .max(160)
    .describe("English SEO meta description, max 155 chars"),
});

export type GeneratedProductCopy = z.infer<typeof CopySchema>;

export async function generateProductCopy(input: {
  productName: string;
  categoryName?: string;
  styleHints?: string;
}): Promise<GeneratedProductCopy | { error: string }> {
  const client = getClient();
  if (!client) {
    return { error: "ANTHROPIC_API_KEY tanimli degil" };
  }

  const systemPrompt = `Sen Modaralist adlı premium streetwear/casual giyim e-ticaret markası için ürün copy yazıyorsun. Marka tonu:
- Sade, modern, hafif lüks (cream/black estetik)
- Marmara bölgesi (İstanbul, Bursa, Kocaeli) odaklı
- Numaralı, sınırlı üretim drop'lar
- "Sezonsuz silüet", "premium dokular", "modern siluetler" gibi temalar

KURALLAR:
- TR ve EN aynı bilgiyi vermeli ama her dilde doğal
- Açıklamalar satış odaklı ama abartılı değil ("revolutionary", "best ever" yok)
- Materyal/bakım gerçekçi (pamuk-polyester karışımı varsayım yapma; verilen ipuçlarına uy)
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
    const response = await client.messages.parse({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: zodOutputFormat(CopySchema),
      },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return { error: "Parse basarisiz" };
    }
    return parsed;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return { error: "Rate limit — birazdan tekrar dene" };
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[ai-copy] API error", err.status, err.message);
      return { error: `API hata (${err.status})` };
    }
    console.error("[ai-copy]", err);
    return { error: "Bilinmeyen hata" };
  }
}
