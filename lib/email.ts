import { Resend } from "resend";

const FROM = "Higher Heels Sanctuary <reservas@higherheels.es>";

const ROOM_NAMES: Record<string, string> = {
  dark: "Sensual",
  clean: "Áurea",
  moon: "Ares",
  test: "Test",
};
const roomName = (id: string) => ROOM_NAMES[id] ?? id;
const durationText = (d: string) => {
  if (d === "1.5") return "1 hora y media";
  if (d === "1") return "1 hora";
  return `${d} horas`;
};

// Shared dark/neon HTML wrapper. `header` is the red banner title.
function shell(header: string, inner: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
        <tr><td style="background:#FF1E3C;padding:32px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Higher Heels Sanctuary</p>
          <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;letter-spacing:2px;color:#fff;">${header}</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">${inner}</td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(245,245,245,0.25);">Higher Heels Sanctuary · Madrid · higherheels.es</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailsTable(rows: [string, string][]): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;margin-bottom:28px;">
    ${rows
      .map(
        ([label, value], i) => `
    <tr style="background:${i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}">
      <td style="padding:14px 20px;font-size:12px;letter-spacing:1px;color:rgba(245,245,245,0.4);text-transform:uppercase;width:42%;">${label}</td>
      <td style="padding:14px 20px;font-size:15px;font-weight:600;color:#f5f5f5;">${value}</td>
    </tr>`
      )
      .join("")}
  </table>`;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!to || !process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY.trim());
  await resend.emails
    .send({ from: FROM, to, subject, html })
    .catch((err) => console.error("Email error:", err));
}

// ── 1) Confirmation email (at booking time, no PIN) ─────────────────────────────
// paymentLabel/paymentValue differ for single booking vs code redemption.
export type ConfirmationEmail = {
  room: string;
  date: string;
  time: string;
  duration: string;
  paymentLabel: string; // "Importe pagado" | "Reservado con"
  paymentValue: string; // "25€" | "Bono Ritual · te quedan 4 entradas"
};

export function buildConfirmationEmailHtml(b: ConfirmationEmail): string {
  const inner = `
    <p style="margin:0 0 28px;color:rgba(245,245,245,0.6);font-size:14px;line-height:1.6;">
      ¡Gracias por tu reserva! Aquí tienes los detalles de tu sesión.
    </p>
    ${detailsTable([
      ["Sala", roomName(b.room)],
      ["Fecha", b.date],
      ["Hora", b.time],
      ["Duración", durationText(b.duration)],
      [b.paymentLabel, b.paymentValue],
    ])}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,30,60,0.06);border:1px solid rgba(255,30,60,0.25);border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;font-size:13px;color:rgba(245,245,245,0.7);line-height:1.6;">
        En breve recibirás tu <strong style="color:#f5f5f5;">código de acceso</strong> en un correo aparte.
        Lo introducirás en el panel de la entrada principal justo antes de tu sesión.
      </td></tr>
    </table>
    <p style="margin:0;font-size:12px;color:rgba(245,245,245,0.4);line-height:1.6;">
      📍 Higher Heels Sanctuary — Madrid · Cancelación gratuita hasta 24h antes.
    </p>`;
  return shell("RESERVA CONFIRMADA", inner);
}

export async function sendConfirmationEmail(to: string, b: ConfirmationEmail): Promise<void> {
  await send(to, `Reserva confirmada · ${b.date} a las ${b.time}`, buildConfirmationEmailHtml(b));
}

// ── 2) Access-code email (always the same; later sent ~10 min before) ───────────
export type AccessCodeEmail = {
  room: string;
  date: string;
  time: string;
  pin: string;
};

export function buildAccessCodeEmailHtml(b: AccessCodeEmail): string {
  const inner = `
    <p style="margin:0 0 24px;color:rgba(245,245,245,0.6);font-size:14px;line-height:1.6;">
      Este es tu código para acceder a Higher Heels Sanctuary. Guárdalo para tu sesión.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,30,60,0.08);border:1px solid rgba(255,30,60,0.3);border-radius:8px;margin-bottom:28px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#FF1E3C;text-transform:uppercase;">Código de acceso</p>
        <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#fff;">${b.pin}</p>
      </td></tr>
    </table>
    ${detailsTable([
      ["Sala", roomName(b.room)],
      ["Fecha", b.date],
      ["Hora", b.time],
    ])}
    <p style="margin:0;font-size:13px;color:rgba(245,245,245,0.5);line-height:1.7;">
      Introdúcelo en el panel de la entrada principal. Válido solo durante tu reserva.
    </p>`;
  return shell("TU CÓDIGO DE ACCESO", inner);
}

export async function sendAccessCodeEmail(to: string, b: AccessCodeEmail): Promise<void> {
  await send(to, `Tu código de acceso · ${b.date} a las ${b.time}`, buildAccessCodeEmailHtml(b));
}

// ── 3) Purchase email — delivers the reusable bono / membresía code ─────────────
export type PurchaseEmail = {
  planLabel: string; // e.g. "Bono Ritual" / "Membresía Oro"
  entradas: number;
  code: string; // HHS-XXXXX
  isSubscription: boolean;
};

export function buildPurchaseEmailHtml(b: PurchaseEmail): string {
  const validity = b.isSubscription
    ? "Se renueva cada mes. Cancela cuando quieras."
    : "Válido 6 meses desde la compra.";
  const inner = `
    <p style="margin:0 0 24px;color:rgba(245,245,245,0.6);font-size:14px;line-height:1.6;">
      ¡Gracias por tu compra! Este es tu código de <strong style="color:#f5f5f5;">${b.planLabel}</strong>.
      Guárdalo: lo usarás para reservar tus sesiones.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,30,60,0.08);border:1px solid rgba(255,30,60,0.3);border-radius:8px;margin-bottom:28px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#FF1E3C;text-transform:uppercase;">Tu código</p>
        <p style="margin:0;font-size:38px;font-weight:900;letter-spacing:6px;color:#fff;">${b.code}</p>
        <p style="margin:10px 0 0;font-size:13px;color:rgba(245,245,245,0.6);">${b.entradas} entradas · ${validity}</p>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:rgba(245,245,245,0.5);line-height:1.7;">
      <strong style="color:#f5f5f5;">Cómo usarlo:</strong> entra en higherheels.es/booking, elige sala, fecha y franja,
      y en el resumen introduce este código en <em>“¿Tienes un bono o membresía?”</em>. Cada reserva descuenta una entrada.
    </p>`;
  return shell("TU CÓDIGO HIGHER HEELS", inner);
}

export async function sendPurchaseEmail(to: string, b: PurchaseEmail): Promise<void> {
  await send(to, `Tu código ${b.planLabel} · Higher Heels`, buildPurchaseEmailHtml(b));
}
