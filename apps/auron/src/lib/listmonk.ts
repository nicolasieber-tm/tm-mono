const LISTMONK_URL = import.meta.env.VITE_LISTMONK_URL;
const LIST_ID = Number(import.meta.env.VITE_LISTMONK_EARLY_ACCESS_LIST_ID);
const API_USER = import.meta.env.VITE_LISTMONK_API_USER;
const API_TOKEN = import.meta.env.VITE_LISTMONK_API_TOKEN;

export type EarlyAccessPayload = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  employees: string;
  currentTracking?: string;
};

export async function subscribeEarlyAccess(payload: EarlyAccessPayload): Promise<void> {
  if (!LISTMONK_URL || !LIST_ID || !API_USER || !API_TOKEN) {
    throw new Error("Listmonk ist nicht konfiguriert.");
  }

  const body = {
    email: payload.email.trim(),
    name: payload.name.trim(),
    status: "enabled",
    lists: [LIST_ID],
    attribs: {
      company: payload.company.trim(),
      phone: payload.phone?.trim() || "",
      employees: payload.employees,
      current_tracking: payload.currentTracking?.trim() || "",
    },
    preconfirm_subscriptions: false,
  };

  const res = await fetch(`${LISTMONK_URL}/api/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${API_USER}:${API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) return;

  // Subscriber already exists: fetch by email, then update attribs + lists.
  if (res.status === 409) {
    const existing = await fetch(
      `${LISTMONK_URL}/api/subscribers?query=${encodeURIComponent(
        `subscribers.email = '${payload.email.trim().toLowerCase()}'`
      )}`,
      {
        headers: { Authorization: `token ${API_USER}:${API_TOKEN}` },
      }
    );

    if (existing.ok) {
      const json = await existing.json();
      const sub = json?.data?.results?.[0];
      if (sub?.id) {
        const putRes = await fetch(`${LISTMONK_URL}/api/subscribers/${sub.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${API_USER}:${API_TOKEN}`,
          },
          body: JSON.stringify({
            email: sub.email,
            name: payload.name.trim(),
            status: "enabled",
            lists: [LIST_ID],
            attribs: { ...(sub.attribs || {}), ...body.attribs },
            preconfirm_subscriptions: false,
          }),
        });
        if (putRes.ok) return;
      }
    }
  }

  let message = `Anmeldung fehlgeschlagen (${res.status}).`;
  try {
    const b = await res.json();
    if (b?.message) message = b.message;
  } catch {
    // body war kein JSON
  }
  throw new Error(message);
}
