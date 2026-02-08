/**
 * Geometry utility functions
 */

import type { Coordinate, BoundingBox } from '../types';

/**
 * Calculate the perpendicular distance from a point to a line segment
 */
export function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // If the line segment is actually a point
  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
}

/**
 * Douglas-Peucker line simplification algorithm
 * @param points Array of [lon, lat] coordinates
 * @param tolerance Tolerance in degrees (for geographic coordinates)
 * @returns Simplified array of coordinates
 */
export function simplifyLine(
  points: Array<[number, number]>,
  tolerance: number = 0.00005 // ~5 meters at equator
): Array<[number, number]> {
  if (points.length <= 2) {
    return points;
  }

  // Find the point with maximum distance from the line between first and last
  let maxDistance = 0;
  let maxIndex = 0;

  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftPart = simplifyLine(points.slice(0, maxIndex + 1), tolerance);
    const rightPart = simplifyLine(points.slice(maxIndex), tolerance);

    // Combine results, removing duplicate point
    return [...leftPart.slice(0, -1), ...rightPart];
  }

  // All points are within tolerance, return just endpoints
  return [first, last];
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @returns Distance in meters
 */
export function haversineDistance(
  coord1: Coordinate | [number, number],
  coord2: Coordinate | [number, number]
): number {
  const R = 6371000; // Earth's radius in meters

  const lat1 = Array.isArray(coord1) ? coord1[1] : coord1.lat;
  const lon1 = Array.isArray(coord1) ? coord1[0] : coord1.lon;
  const lat2 = Array.isArray(coord2) ? coord2[1] : coord2.lat;
  const lon2 = Array.isArray(coord2) ? coord2[0] : coord2.lon;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate total length of a polyline in meters
 */
export function polylineLength(coordinates: Array<[number, number]>): number {
  let length = 0;
  for (let i = 1; i < coordinates.length; i++) {
    length += haversineDistance(coordinates[i - 1], coordinates[i]);
  }
  return length;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate bounding box from coordinates
 */
export function calculateBounds(coordinates: Array<[number, number]>): BoundingBox {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const [lon, lat] of coordinates) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }

  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Merge multiple bounding boxes into one
 */
export function mergeBounds(boxes: BoundingBox[]): BoundingBox {
  return boxes.reduce(
    (merged, box) => ({
      minLat: Math.min(merged.minLat, box.minLat),
      maxLat: Math.max(merged.maxLat, box.maxLat),
      minLon: Math.min(merged.minLon, box.minLon),
      maxLon: Math.max(merged.maxLon, box.maxLon),
    }),
    {
      minLat: Infinity,
      maxLat: -Infinity,
      minLon: Infinity,
      maxLon: -Infinity,
    }
  );
}

/**
 * Add padding to a bounding box
 * @param padding Padding factor (0.1 = 10% on each side)
 */
export function padBounds(bounds: BoundingBox, padding: number = 0.1): BoundingBox {
  const latRange = bounds.maxLat - bounds.minLat;
  const lonRange = bounds.maxLon - bounds.minLon;

  return {
    minLat: bounds.minLat - latRange * padding,
    maxLat: bounds.maxLat + latRange * padding,
    minLon: bounds.minLon - lonRange * padding,
    maxLon: bounds.maxLon + lonRange * padding,
  };
}
