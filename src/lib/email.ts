import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

let _resend: Resend | null = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Modaralist <no-reply@modaralist.com>";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs) {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY yok, mail atlanıyor:", { to, subject });
    return { id: null };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo,
    });
    if (error) {
      console.error("[email] gönderim hatası", error);
      Sentry.captureException(error, { tags: { area: "email" }, extra: { to, subject } });
      return { id: null };
    }
    return { id: data?.id ?? null };
  } catch (err) {
    console.error("[email] istisna", err);
    Sentry.captureException(err, { tags: { area: "email" }, extra: { to, subject } });
    return { id: null };
  }
}

export function baseLayout({ title, body }: { title: string; body: string }) {
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f2ed;font-family:Inter,Helvetica,Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2ed;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e1db;">
            <tr>
              <td style="padding:32px 40px;border-bottom:1px solid #e5e1db;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:-0.02em;">modaralist</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background:#f5f2ed;border-top:1px solid #e5e1db;font-size:12px;color:#8a8a8a;text-align:center;">
                © ${new Date().getFullYear()} Modaralist · Tüm hakları saklıdır<br/>
                <a href="https://modaralist.com" style="color:#8a8a8a;text-decoration:underline;">modaralist.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function orderConfirmationHtml(args: {
  orderNumber: string;
  customerName: string;
  total: string;
  items: {
    name: string;
    variant?: string;
    quantity: number;
    total: string;
    image?: string;
  }[];
  address: string;
  trackUrl?: string;
  registerUrl?: string;
  guestCheckout?: boolean;
}) {
  const safeTrackUrl = args.trackUrl ? escapeHtml(args.trackUrl) : "";
  const safeRegisterUrl = args.registerUrl ? escapeHtml(args.registerUrl) : "";
  const addressHtml = escapeHtml(args.address).replace(/\n/g, "<br/>");
  const rows = args.items
    .map(
      (it) => `
    <tr>
      <td width="72" style="padding:12px 16px 12px 0;border-bottom:1px solid #e5e1db;vertical-align:top;">
        ${
          it.image
            ? `<img src="${escapeHtml(it.image)}" width="64" height="80" alt="${escapeHtml(it.name)}" style="display:block;width:64px;height:80px;object-fit:cover;border:1px solid #e5e1db;background:#f5f2ed;" />`
            : `<div style="width:64px;height:80px;background:#f5f2ed;border:1px solid #e5e1db;"></div>`
        }
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e1db;vertical-align:top;">
        <div style="font-size:14px;">${escapeHtml(it.name)}</div>
        ${it.variant ? `<div style="font-size:11px;color:#8a8a8a;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">${escapeHtml(it.variant)} · ${it.quantity} adet</div>` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e1db;text-align:right;font-variant-numeric:tabular-nums;">${escapeHtml(it.total)}</td>
    </tr>`
    )
    .join("");

  return baseLayout({
    title: "Siparişin alındı",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— sipariş alındı</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">Hoş geldin drop'a, ${escapeHtml(args.customerName)}.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 32px;">
        Siparişin alındı. Kargolanınca tekrar haber vereceğiz. Aşağıda özeti ve takip bağlantısı var.
      </p>
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Sipariş No</p>
      <p style="font-size:16px;font-variant-numeric:tabular-nums;margin:0 0 24px;">${escapeHtml(args.orderNumber)}</p>
      ${
        safeTrackUrl
          ? `<a href="${safeTrackUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 24px;">Siparişi Takip Et</a>`
          : ""
      }
      ${
        args.guestCheckout && safeRegisterUrl
          ? `<div style="margin:8px 0 32px;padding:20px;background:#f5f2ed;border:1px solid #e5e1db;">
              <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Hesapla daha kolay</p>
              <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Bu e-postayla hesap oluşturursan siparişin otomatik olarak Siparişlerim alanına bağlanır. Kayıt olmak istemezsen takip bağlantısı sipariş numaran ve e-postanla çalışır.</p>
              <a href="${safeRegisterUrl}" style="color:#0a0a0a;text-decoration:underline;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Hesap Oluştur</a>
            </div>`
          : ""
      }
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e1db;">
        ${rows}
        <tr>
          <td style="padding:16px 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;">Toplam</td>
          <td style="padding:16px 0;text-align:right;font-variant-numeric:tabular-nums;font-size:16px;">${escapeHtml(args.total)}</td>
        </tr>
      </table>
      <div style="margin-top:32px;padding:20px;background:#f5f2ed;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Teslimat</p>
        <p style="font-size:14px;line-height:1.6;margin:0;">${addressHtml}</p>
      </div>
      <p style="margin-top:40px;font-size:12px;color:#8a8a8a;">Sorun varsa bu e-postayı yanıtla.</p>
    `,
  });
}

export function passwordResetHtml(args: {
  name: string | null;
  resetUrl: string;
  ttlMinutes: number;
}) {
  const greeting = args.name ? `Merhaba ${args.name}` : "Merhaba";
  return baseLayout({
    title: "Şifre sıfırlama",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— şifre sıfırlama</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">${greeting}.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 24px;">
        Modaralist hesabın için şifre sıfırlama talebi aldık. Aşağıdaki bağlantıyla yeni şifre belirleyebilirsin. Bağlantı <strong>${args.ttlMinutes} dakika</strong> geçerli.
      </p>
      <a href="${args.resetUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Yeni Şifre Belirle</a>
      <p style="margin-top:32px;font-size:12px;color:#8a8a8a;line-height:1.6;">
        Bu talebi sen yapmadıysan bu e-postayı görmezden gel; hesabın güvende.
      </p>
      <p style="margin-top:24px;font-size:11px;color:#8a8a8a;word-break:break-all;">
        Bağlantı çalışmıyorsa tarayıcına yapıştır:<br/>
        <span style="color:#0a0a0a;">${args.resetUrl}</span>
      </p>
    `,
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string | null;
  resetUrl: string;
  ttlMinutes: number;
}) {
  const resend = getResend();
  if (!resend) {
    // Resend kurulu değilken dev için URL'i logla, test edilebilir olsun.
    // Prod'da ASLA loglama — reset token'i loglara/Sentry breadcrumb'larina sizar.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email/sim] password reset for ${args.to}: ${args.resetUrl}`);
    } else {
      console.warn(
        `[email] RESEND_API_KEY yok — ${args.to} icin sifre sifirlama maili GONDERILEMEDI`
      );
    }
    return { id: null };
  }
  return sendEmail({
    to: args.to,
    subject: "Modaralist — şifre sıfırlama",
    html: passwordResetHtml({
      name: args.name,
      resetUrl: args.resetUrl,
      ttlMinutes: args.ttlMinutes,
    }),
  });
}

export function reviewRequestHtml(args: {
  customerName: string;
  orderNumber: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  reviewUrl: string;
}) {
  return baseLayout({
    title: "Aldığın parça nasıldı?",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— teslim sonrası</p>
      <h1 style="font-family:Georgia,serif;font-size:32px;margin:16px 0 8px;letter-spacing:-0.02em;">${args.customerName}, parçan nasıldı?</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 32px;">
        Birkaç gün önce teslim aldığın siparişle ilgili kısa bir değerlendirme yazabilir misin? Diğer müşterilere yön vermek için 30 saniyen yeter.
      </p>
      ${
        args.productImage
          ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;"><tr>
              <td width="100" style="padding-right:16px;vertical-align:top;">
                <img src="${args.productImage}" width="100" alt="${args.productName}" style="display:block;border:1px solid #e5e1db;" />
              </td>
              <td style="vertical-align:top;">
                <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 6px;">Sipariş ${args.orderNumber}</p>
                <p style="font-size:16px;margin:0;">${args.productName}</p>
              </td>
            </tr></table>`
          : `<p style="font-size:14px;margin:0 0 16px;"><strong>${args.productName}</strong></p>`
      }
      <a href="${args.reviewUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">★ Değerlendirme Yaz</a>
      <p style="margin-top:32px;font-size:12px;color:#8a8a8a;line-height:1.6;">
        Yorum yazmak istemiyorsan bu e-postayı görmezden gel — bir daha hatırlatmayız.
      </p>
    `,
  });
}

export function dropNotifyHtml(args: {
  customerName?: string;
  collectionName: string;
  collectionSlug: string;
  heroImageUrl?: string;
  baseUrl: string;
}) {
  const greeting = args.customerName ? `Merhaba ${args.customerName}` : "Merhaba";
  return baseLayout({
    title: `${args.collectionName} açıldı`,
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— drop açıldı</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">${greeting}.</h1>
      <p style="font-size:18px;line-height:1.4;margin:16px 0 24px;">
        <strong>${args.collectionName}</strong> şu an satışta.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:0 0 32px;">
        Beklediğin koleksiyon canlı. Numaralı, sınırlı — bittiğinde bittidir.
      </p>
      ${
        args.heroImageUrl
          ? `<img src="${args.heroImageUrl}" width="520" alt="${args.collectionName}" style="display:block;width:100%;max-width:520px;margin-bottom:24px;border:1px solid #e5e1db;" />`
          : ""
      }
      <a href="${args.baseUrl}/drops/${args.collectionSlug}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Koleksiyonu Gör</a>
      <p style="margin-top:32px;font-size:12px;color:#8a8a8a;line-height:1.6;">
        Bu e-postayı sen "haber ver" listesine kayıt olduğun için aldın.
      </p>
    `,
  });
}

export function abandonedCartHtml(args: {
  customerName?: string;
  items: { name: string; image?: string; price: string }[];
  cartUrl: string;
  discountCode?: string;
}) {
  const greeting = args.customerName ? `${args.customerName},` : "Merhaba,";
  const itemRows = args.items
    .slice(0, 4)
    .map(
      (it) => `
    <tr>
      <td width="80" style="padding:12px 16px 12px 0;vertical-align:top;">
        ${it.image ? `<img src="${it.image}" width="80" alt="${it.name}" style="display:block;border:1px solid #e5e1db;" />` : `<div style="width:80px;height:100px;background:#e5e1db;"></div>`}
      </td>
      <td style="padding:12px 0;vertical-align:top;">
        <p style="font-size:14px;margin:0;">${it.name}</p>
        <p style="font-size:13px;margin:6px 0 0;color:#0a0a0a;font-variant-numeric:tabular-nums;">${it.price}</p>
      </td>
    </tr>`
    )
    .join("");

  return baseLayout({
    title: "Sepetinde bir şey unuttun",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— sepetinde bekliyor</p>
      <h1 style="font-family:Georgia,serif;font-size:32px;margin:16px 0 8px;letter-spacing:-0.02em;">${greeting} sepetin hâlâ açık.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 24px;">
        Drop'lar sınırlı — beğendiğin parça başkasına gidebilir. Sepetine geri dön ve tamamla.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border-top:1px solid #e5e1db;">
        ${itemRows}
      </table>
      ${
        args.discountCode
          ? `<div style="margin:24px 0;padding:20px;background:#f5f2ed;text-align:center;">
              <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Bugüne özel kod</p>
              <p style="font-family:Georgia,serif;font-size:24px;letter-spacing:0.1em;margin:0;">${args.discountCode}</p>
              <p style="font-size:11px;color:#8a8a8a;margin:8px 0 0;">Checkout'ta uygula.</p>
            </div>`
          : ""
      }
      <a href="${args.cartUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Sepete Dön</a>
    `,
  });
}

export function shipmentUpdateHtml(args: {
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  orderTrackUrl?: string;
}) {
  const safeTrackingUrl = args.trackingUrl ? escapeHtml(args.trackingUrl) : "";
  const safeOrderTrackUrl = args.orderTrackUrl
    ? escapeHtml(args.orderTrackUrl)
    : "";

  return baseLayout({
    title: "Siparişin yola çıktı",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— kargoda</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">${escapeHtml(args.customerName)}, siparişin yola çıktı.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 32px;">
        ${escapeHtml(args.carrier)} ile gönderildi. Takip numarasıyla yolu boyunca nerede olduğunu görebilirsin.
      </p>
      <div style="padding:20px;background:#f5f2ed;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Takip No</p>
        <p style="font-size:16px;font-variant-numeric:tabular-nums;margin:0;">${escapeHtml(args.trackingNumber)}</p>
      </div>
      <div style="display:block;margin-bottom:24px;">
        ${
          safeTrackingUrl
            ? `<a href="${safeTrackingUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 8px 12px 0;">Kargoyu Takip Et</a>`
            : ""
        }
        ${
          safeOrderTrackUrl
            ? `<a href="${safeOrderTrackUrl}" style="display:inline-block;border:1px solid #0a0a0a;color:#0a0a0a;padding:13px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px 0;">Sipariş Durumu</a>`
            : ""
        }
      </div>
      <p style="margin-top:32px;font-size:12px;color:#8a8a8a;">Sipariş no: ${escapeHtml(args.orderNumber)}</p>
    `,
  });
}
