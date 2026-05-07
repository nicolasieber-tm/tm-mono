const SUBMIT_URL = import.meta.env.VITE_SUBMIT_LEAD_URL;
const SUBMIT_SECRET = import.meta.env.VITE_SUBMIT_LEAD_SECRET;

export type LeadAnswers = {
  company_name: string;
  employees: string;
  time_tracking: string;
  erp: string;
  pain_points: string[];
  timeline: string;
};

export async function submitLead(answers: LeadAnswers): Promise<string> {
  if (!SUBMIT_URL || !SUBMIT_SECRET) {
    throw new Error("Lead-Submit ist nicht konfiguriert.");
  }
  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auron-secret": SUBMIT_SECRET,
    },
    body: JSON.stringify(answers),
  });
  if (!res.ok) {
    throw new Error(`submit-lead failed (${res.status})`);
  }
  const json = (await res.json()) as { lead_id?: string };
  if (!json.lead_id) throw new Error("submit-lead ohne lead_id");
  return json.lead_id;
}
