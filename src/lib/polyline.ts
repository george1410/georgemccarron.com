// Google encoded polyline decoder + SVG path helper.
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm

export type LatLng = [number, number];

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Fit a list of lat/lng points into a width×height SVG viewBox with padding,
// returning an SVG path `d` string. Preserves aspect ratio and centres the
// route in the box so routes of any shape look balanced.
export function polylineToSvgPath(
  points: LatLng[],
  width: number,
  height: number,
  padding = 4,
): string {
  if (points.length === 0) return "";

  let minLat = points[0]![0];
  let maxLat = points[0]![0];
  let minLng = points[0]![1];
  let maxLng = points[0]![1];
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const latRange = maxLat - minLat || 1e-9;
  // Correct for Mercator-ish squish at this latitude — one degree of
  // longitude is narrower than one of latitude away from the equator.
  const cosLat = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const lngRange = (maxLng - minLng) * cosLat || 1e-9;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / lngRange, innerH / latRange);
  const offsetX = padding + (innerW - lngRange * scale) / 2;
  const offsetY = padding + (innerH - latRange * scale) / 2;

  let d = "";
  for (let i = 0; i < points.length; i++) {
    const [lat, lng] = points[i]!;
    const x = offsetX + (lng - minLng) * cosLat * scale;
    const y = offsetY + (maxLat - lat) * scale;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}
