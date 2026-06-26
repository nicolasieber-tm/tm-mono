/* eslint-disable @typescript-eslint/no-explicit-any */
// Storage-Stub für den Demo-Modus. Es werden keine echten Dateien hoch-/heruntergeladen.
// Uploads sind No-ops mit Erfolg; getPublicUrl liefert die übergebene URL zurück, falls
// es schon eine vollständige/Data-URL ist, sonst einen eingebetteten Beleg-Platzhalter.

// Schlichtes, neutrales Beleg-Platzhalterbild (SVG als Data-URL) — keine echten Belege.
export const DEMO_RECEIPT_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440">
       <rect width="320" height="440" rx="14" fill="#ffffff" stroke="#E4E6EA"/>
       <rect x="28" y="34" width="150" height="16" rx="4" fill="#E4E6EA"/>
       <rect x="28" y="70" width="100" height="12" rx="4" fill="#EFF0F3"/>
       <rect x="28" y="120" width="264" height="10" rx="4" fill="#EFF0F3"/>
       <rect x="28" y="146" width="240" height="10" rx="4" fill="#EFF0F3"/>
       <rect x="28" y="172" width="264" height="10" rx="4" fill="#EFF0F3"/>
       <rect x="28" y="198" width="180" height="10" rx="4" fill="#EFF0F3"/>
       <rect x="28" y="360" width="120" height="14" rx="4" fill="#3B82F6" opacity="0.18"/>
       <rect x="196" y="356" width="96" height="22" rx="6" fill="#3B82F6" opacity="0.25"/>
       <text x="160" y="420" font-family="Inter, sans-serif" font-size="13" fill="#5C636E" text-anchor="middle">Demo-Beleg</text>
     </svg>`
  );

function publicUrlFor(path: string): string {
  if (!path) return DEMO_RECEIPT_PLACEHOLDER;
  if (path.startsWith("data:") || path.startsWith("http") || path.startsWith("blob:")) return path;
  return DEMO_RECEIPT_PLACEHOLDER;
}

export const demoStorage = {
  from(_bucket: string) {
    return {
      async upload(path: string) {
        return { data: { path, id: path, fullPath: path }, error: null };
      },
      async remove() {
        return { data: [], error: null };
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: publicUrlFor(path) } };
      },
      async createSignedUrl(path: string) {
        return { data: { signedUrl: publicUrlFor(path) }, error: null };
      },
      async download() {
        return { data: new Blob(), error: null };
      },
      async list() {
        return { data: [], error: null };
      },
    };
  },
};
