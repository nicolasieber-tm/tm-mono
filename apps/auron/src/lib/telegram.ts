const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export type TelegramPayload = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  employees: string;
  currentTracking?: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function notifyTelegram(payload: TelegramPayload): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return;

  const lines = [
    "🎉 <b>Neue Early-Access-Anmeldung</b>",
    "",
    `<b>Name:</b> ${esc(payload.name.trim())}`,
    `<b>Firma:</b> ${esc(payload.company.trim())}`,
    `<b>E-Mail:</b> ${esc(payload.email.trim())}`,
    `<b>Telefon:</b> ${payload.phone?.trim() ? esc(payload.phone.trim()) : "–"}`,
    `<b>Mitarbeitende:</b> ${esc(payload.employees)}`,
    `<b>Aktuelle Zeiterfassung:</b> ${payload.currentTracking?.trim() ? esc(payload.currentTracking.trim()) : "–"}`,
  ];

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}
