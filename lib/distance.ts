/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @param inMiles - If true, returns distance in miles. Defaults to kilometers.
 * @returns Distance in kilometers or miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  inMiles: boolean = false
): number {
  const R_KM = 6371.0088; // Earth’s mean radius in kilometers
  const R_MI = 3958.7613; // Earth's mean radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = inMiles ? R_MI : R_KM;

  const distance = radius * c;
  return Math.round((distance + Number.EPSILON) * 10) / 10; // Rounded to 1 decimal
}

/**
 * Nairobi Center Coordinates (for reference)
 */
export const NAIROBI_CENTER = {
  lat: -1.2921,
  lng: 36.8219
};
