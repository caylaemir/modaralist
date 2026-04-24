import { Resend } from "resend";

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
      return { id: null };
    }
    return { id: data?.id ?? null };
  } catch (err) {
    console.error("[email] istisna", err);
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
  items: { name: string; variant?: string; quantity: number; total: string }[];
  address: string;
}) {
  const rows = args.items
    .map(
      (it) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e1db;">
        <div style="font-size:14px;">${it.name}</div>
        ${it.variant ? `<div style="font-size:11px;color:#8a8a8a;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">${it.variant} · ${it.quantity} adet</div>` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e1db;text-align:right;font-variant-numeric:tabular-nums;">${it.total}</td>
    </tr>`
    )
    .join("");

  return baseLayout({
    title: "Siparişin alındı",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— sipariş alındı</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">Hoş geldin drop'a, ${args.customerName}.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 32px;">
        Siparişin alındı. Kargolanınca tekrar haber vereceğiz. Aşağıda özeti var.
      </p>
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Sipariş No</p>
      <p style="font-size:16px;font-variant-numeric:tabular-nums;margin:0 0 32px;">${args.orderNumber}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e1db;">
        ${rows}
        <tr>
          <td style="padding:16px 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;">Toplam</td>
          <td style="padding:16px 0;text-align:right;font-variant-numeric:tabular-nums;font-size:16px;">${args.total}</td>
        </tr>
      </table>
      <div style="margin-top:32px;padding:20px;background:#f5f2ed;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Teslimat</p>
        <p style="font-size:14px;line-height:1.6;margin:0;">${args.address}</p>
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
    console.log(`[email/sim] password reset for ${args.to}: ${args.resetUrl}`);
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

export function shipmentUpdateHtml(args: {
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
}) {
  return baseLayout({
    title: "Siparişin yola çıktı",
    body: `
      <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0;">— kargoda</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;margin:16px 0 8px;letter-spacing:-0.02em;">${args.customerName}, siparişin yola çıktı.</h1>
      <p style="font-size:14px;line-height:1.6;color:#8a8a8a;margin:16px 0 32px;">
        ${args.carrier} ile gönderildi. Takip numarasıyla yolu boyunca nerede olduğunu görebilirsin.
      </p>
      <div style="padding:20px;background:#f5f2ed;margin-bottom:24px;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">Takip No</p>
        <p style="font-size:16px;font-variant-numeric:tabular-nums;margin:0;">${args.trackingNumber}</p>
      </div>
      ${args.trackingUrl ? `<a href="${args.trackingUrl}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Kargoyu Takip Et</a>` : ""}
      <p style="margin-top:32px;font-size:12px;color:#8a8a8a;">Sipariş no: ${args.orderNumber}</p>
    `,
  });
}
