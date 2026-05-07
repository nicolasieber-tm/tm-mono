const ALLOWED_ORIGINS = [
  "https://auron.ch",
  "https://www.auron.ch",
  "https://auron.trendingmedia.ch",
  "http://localhost:8080",
  "http://localhost:5173",
];

export function corsHeaders(origin: string | null): HeadersInit {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://auron.ch";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "content-type, x-auron-secret, authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
