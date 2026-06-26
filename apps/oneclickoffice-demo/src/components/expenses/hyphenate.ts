/**
 * Inserts soft hyphens (U+00AD) at likely German compound-word boundaries
 * so the browser's CSS `hyphens: auto` prefers breaking at the morpheme
 * boundary rather than at an arbitrary syllable mid-word.
 *
 * Example: "Sozialversicherungen" → "Sozial\u00ADversicherungen"
 * so the browser renders "Sozial-\nversicherungen" instead of
 * "Sozialversiche-\nrungen".
 *
 * This is a heuristic: it looks for known German compound second-elements
 * (suffixes like "versicherung", "kosten", "rechnung") and inserts a soft
 * hyphen right before them when a meaningful prefix exists.
 *
 * Soft hyphens are invisible unless the browser needs to break the line,
 * so adding them is safe for short words and narrow contexts alike.
 */

const SOFT_HYPHEN = "\u00AD";
const ZERO_WIDTH_SPACE = "\u200B";

/**
 * Known second-elements of German compound words commonly seen in the
 * Spesen (expenses) and general business context. Order matters for
 * longer variants (plural forms must come before singular so they match
 * first in case both exist in the same word).
 */
const COMPOUND_SUFFIXES = [
  // Versicherungen
  "versicherungen",
  "versicherung",
  // Rechnungen / Abrechnungen / Erstattungen
  "abrechnungen",
  "abrechnung",
  "erstattungen",
  "erstattung",
  "rechnungen",
  "rechnung",
  // Zahlungen
  "zahlungen",
  "zahlung",
  // Gebühren / Beiträge / Prämien
  "gebühren",
  "gebühr",
  "beiträge",
  "beitrag",
  "prämien",
  "prämie",
  // Bildung & Schulungen
  "fortbildung",
  "weiterbildung",
  "ausbildung",
  "schulungen",
  "schulung",
  "bildung",
  // Verträge / Abonnements / Lizenzen
  "verträge",
  "vertrag",
  "abonnements",
  "abonnement",
  "lizenzen",
  "lizenz",
  // Kosten / Ausgaben / Spesen / Unterhalt
  "ausgaben",
  "ausgabe",
  "kosten",
  "spesen",
  "unterhalt",
  // Verpflegung & Reise (häufige Compounds)
  "verpflegung",
  "unterkunft",
  "übernachtung",
  "übernachtungen",
  // Lieferungen / Transport
  "lieferungen",
  "lieferung",
  "transport",
  // Wartung / Reparatur / Installation
  "installationen",
  "installation",
  "reparaturen",
  "reparatur",
  "wartung",
  // Verwaltung & Prozesse
  "verwaltungen",
  "verwaltung",
  "pauschalen",
  "pauschale",
  // Honorare / Gehälter
  "honorare",
  "honorar",
  "gehälter",
  "gehalt",
  // Einfache Substantive
  "material",
  "bedarf",
  "mittel",
  "miete",
  "pacht",
];

const MIN_WORD_LENGTH = 8; // Don't bother with short words (covers "Büromaterial", "Essenspesen", etc.)
const MIN_PREFIX_LENGTH = 3; // Don't split if prefix would be < 3 chars

/**
 * Inserts soft hyphens at detected compound boundaries in a single word.
 * Multi-word strings (with spaces) are processed word-by-word.
 */
export function hyphenateGermanCompound(text: string): string {
  if (!text) return text;
  // Process each whitespace-separated token independently
  return text
    .split(/(\s+)/)
    .map((token) => (isWhitespace(token) ? token : hyphenateToken(token)))
    .join("");
}

function isWhitespace(s: string): boolean {
  return /^\s+$/.test(s);
}

function hyphenateToken(word: string): string {
  if (word.length < MIN_WORD_LENGTH) return word;

  // Allow the browser to break after slashes in names like "Benzin/Unterhalt".
  // A zero-width space is invisible but marks a valid line-break position.
  let result = word.includes("/")
    ? word.replace(/\//g, "/" + ZERO_WIDTH_SPACE)
    : word;

  for (const suffix of COMPOUND_SUFFIXES) {
    let searchStart = 0;
    while (true) {
      const lower = result.toLowerCase();
      const idx = lower.indexOf(suffix, searchStart);
      if (idx === -1) break;

      // Require a meaningful prefix (at least MIN_PREFIX_LENGTH chars before
      // the suffix) and skip if a break marker is already right before.
      const hasPrefix = idx >= MIN_PREFIX_LENGTH;
      const prevChar = result.charAt(idx - 1);
      const alreadyMarked =
        prevChar === SOFT_HYPHEN || prevChar === ZERO_WIDTH_SPACE;

      if (hasPrefix && !alreadyMarked) {
        result = result.slice(0, idx) + SOFT_HYPHEN + result.slice(idx);
        // Advance past the inserted hyphen + the matched suffix
        searchStart = idx + 1 + suffix.length;
      } else {
        searchStart = idx + suffix.length;
      }
    }
  }
  return result;
}
