// Zentrale, stabile IDs & Konstanten für den Demo-Modus.
// Werden sowohl vom Mock-Client (Auth) als auch von den Seed-Daten genutzt,
// damit Fremdschlüssel zwischen den Tabellen konsistent zusammenpassen.

export const DEMO_USER_ID = "demo-user-0000-0000-0000-000000000001";
export const DEMO_COMPANY_ID = "demo-untern-0000-0000-0000-00000000aaaa"; // unternehmen.id (Mandant)

export const DEMO_USER = {
  id: DEMO_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "demo@oneclick-office.ch",
  email_confirmed_at: "2025-01-01T00:00:00.000Z",
  phone: "",
  confirmed_at: "2025-01-01T00:00:00.000Z",
  last_sign_in_at: "2025-01-01T00:00:00.000Z",
  app_metadata: { provider: "demo", providers: ["demo"] },
  user_metadata: { first_name: "Demo", last_name: "Coach" },
  identities: [],
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
} as const;

export const DEMO_SESSION = {
  access_token: "demo-access-token",
  refresh_token: "demo-refresh-token",
  expires_in: 3600,
  // Weit in der Zukunft, damit nichts „abläuft".
  expires_at: 4102444800, // 2100-01-01
  token_type: "bearer",
  user: DEMO_USER,
} as const;
