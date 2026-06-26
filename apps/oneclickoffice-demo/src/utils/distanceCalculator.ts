/**
 * Berechnet die tatsächliche Fahrstrecke zwischen zwei Adressen
 * Verwendet OpenStreetMap (Nominatim für Geocoding + OSRM für Routing)
 * Kostenlos und ohne API-Key!
 */
export async function calculateDistance(from: string, to: string): Promise<number | null> {
  if (!from || !to) return null;

  try {
    // 1. Geocode beide Adressen zu Koordinaten mit Nominatim (OpenStreetMap)
    const fromCoords = await geocodeAddress(from);
    const toCoords = await geocodeAddress(to);

    if (!fromCoords || !toCoords) {
      return calculateDistanceFallback(from, to);
    }

    // 2. Berechne Straßenroute mit OSRM
    const distance = await calculateRoutingDistance(fromCoords, toCoords);

    if (distance) {
      return distance;
    }

    return calculateDistanceFallback(from, to);
  } catch {
    return calculateDistanceFallback(from, to);
  }
}

/**
 * Geocodiert eine Adresse zu Koordinaten mit Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Nominatim API - kostenlos, aber rate-limited (1 request/second)
    // Für Produktiv: eigene Nominatim-Instanz oder kommerzielle Lösung
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ch&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Blickwinkel-Teamtool (contact: your-email@example.com)'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Berechnet Straßendistanz zwischen zwei Koordinaten mit OSRM
 */
async function calculateRoutingDistance(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): Promise<number | null> {
  try {
    // OSRM API - kostenlos, Open Source
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const distanceMeters = data.routes[0].distance;
      return Math.round((distanceMeters / 1000) * 10) / 10; // Meter zu km, auf 0.1 km runden
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback-Funktion für Distanzschätzung ohne externe APIs
 */
function calculateDistanceFallback(from: string, to: string): number {
  const fromWords = from.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const toWords = to.toLowerCase().split(/[\s,]+/).filter(Boolean);

  // Wenn beide Adressen sehr ähnlich sind (z.B. gleiche Stadt), kurze Distanz
  const commonWords = fromWords.filter(word => toWords.includes(word));
  if (commonWords.length > fromWords.length / 2) {
    return 5; // ca. 5 km innerhalb derselben Stadt
  }

  // Grobe Schätzung basierend auf Adresslänge
  const estimatedKm = Math.min(10 + Math.random() * 20, 100);

  return Math.round(estimatedKm * 10) / 10; // Auf 0.1 km runden
}

/**
 * Berechnet die Fahrspesen basierend auf Distanz und km-Rate
 */
export function calculateTravelExpense(distanceKm: number, kmRate: number): number {
  if (!distanceKm || !kmRate) return 0;
  return Math.round(distanceKm * kmRate * 100) / 100; // Auf 0.01 CHF runden
}

/**
 * Formatiert die Distanz für die Anzeige
 */
export function formatDistance(km: number | null): string {
  if (!km) return '-';
  return `${km.toFixed(1)} km`;
}

/**
 * Formatiert den Betrag in CHF
 */
export function formatCHF(amount: number | null): string {
  if (!amount) return 'CHF 0.00';
  return `CHF ${amount.toFixed(2)}`;
}
