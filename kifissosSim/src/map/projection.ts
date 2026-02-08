/**
 * Map Projection utilities for Athens/Kifissos corridor
 *
 * Uses Mercator projection centered on Athens for accurate local rendering.
 * D3's geoMercator is used for consistency with web mapping standards.
 */

import * as d3 from 'd3';
import type { BoundingBox } from '../types';

export interface ProjectionConfig {
  bounds: BoundingBox;
  width: number;
  height: number;
  padding?: number;
}

export interface MapProjection {
  project: (coord: [number, number]) => [number, number];
  unproject: (point: [number, number]) => [number, number];
  scale: number;
  translate: [number, number];
  bounds: BoundingBox;
}

/**
 * Create a Mercator projection fitted to the given bounds
 */
export function createProjection(config: ProjectionConfig): MapProjection {
  const { bounds, width, height, padding = 20 } = config;

  // Calculate center of bounds
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;

  // Create initial projection centered on Athens area
  const projection = d3.geoMercator()
    .center([centerLon, centerLat])
    .scale(1)
    .translate([width / 2, height / 2]);

  // Calculate the scale that fits the bounds
  const corners: Array<[number, number]> = [
    [bounds.minLon, bounds.minLat],
    [bounds.maxLon, bounds.minLat],
    [bounds.minLon, bounds.maxLat],
    [bounds.maxLon, bounds.maxLat],
  ];

  const projected = corners.map(c => projection(c) as [number, number]);

  const xExtent = d3.extent(projected, d => d[0]) as [number, number];
  const yExtent = d3.extent(projected, d => d[1]) as [number, number];

  const projWidth = xExtent[1] - xExtent[0];
  const projHeight = yExtent[1] - yExtent[0];

  const scale = Math.min(
    (width - 2 * padding) / projWidth,
    (height - 2 * padding) / projHeight
  );

  // Update projection with calculated scale
  projection.scale(scale);

  // Recalculate translation to center the bounds
  const projectedCenter = projection([centerLon, centerLat]) as [number, number];
  const translateX = width / 2 - projectedCenter[0] + width / 2;
  const translateY = height / 2 - projectedCenter[1] + height / 2;

  projection.translate([translateX, translateY]);

  // Verify and adjust if needed
  const testCorners = corners.map(c => projection(c) as [number, number]);
  const testXExtent = d3.extent(testCorners, d => d[0]) as [number, number];
  const testYExtent = d3.extent(testCorners, d => d[1]) as [number, number];

  const finalTranslateX = (width - (testXExtent[1] + testXExtent[0])) / 2;
  const finalTranslateY = (height - (testYExtent[1] + testYExtent[0])) / 2;

  projection.translate([
    projection.translate()[0] + finalTranslateX,
    projection.translate()[1] + finalTranslateY,
  ]);

  return {
    project: (coord: [number, number]) => projection(coord) as [number, number],
    unproject: (point: [number, number]) => projection.invert!(point) as [number, number],
    scale,
    translate: projection.translate() as [number, number],
    bounds,
  };
}

/**
 * Apply zoom transform to a projection
 */
export function transformProjection(
  baseProjection: MapProjection,
  transform: d3.ZoomTransform
): (coord: [number, number]) => [number, number] {
  return (coord: [number, number]) => {
    const [x, y] = baseProjection.project(coord);
    return [
      transform.x + x * transform.k,
      transform.y + y * transform.k,
    ];
  };
}

/**
 * Calculate appropriate initial zoom level
 * Returns higher zoom to show a section of the highway in detail
 */
export function calculateMobileZoom(width: number, height: number): number {
  // Start zoomed in to show highway detail (like reference image)
  if (width < 400) return 2.5;
  if (width < 600) return 3.0;
  return 3.5;
}
