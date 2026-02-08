/**
 * Vehicle Renderer
 *
 * Efficiently renders vehicles on a Canvas layer using the simulation state.
 * Optimized for mobile performance with thousands of vehicles.
 */

import type { Vehicle, VehicleType } from '../types';
import { VEHICLE_PARAMS } from '../types/vehicle';
import type { SimSegment, RoadNetwork } from '../simulation';
import type { MapProjection } from './projection';
import * as d3 from 'd3';

/**
 * Vehicle colors by type (vibrant colors for visibility against gray roads)
 */
const VEHICLE_COLORS: Record<VehicleType, string> = {
  car: '#1a73e8',      // Blue
  taxi: '#fbbc04',     // Yellow
  bus: '#34a853',      // Green
  truck: '#ea4335',    // Red
  motorbike: '#9334e6', // Purple
};

/**
 * Vehicle sizes (width in pixels at zoom 1) - larger for visibility
 */
const VEHICLE_SIZES: Record<VehicleType, { width: number; height: number }> = {
  car: { width: 5, height: 10 },
  taxi: { width: 5, height: 10 },
  bus: { width: 6, height: 18 },
  truck: { width: 6, height: 20 },
  motorbike: { width: 3, height: 6 },
};

export interface VehicleRendererConfig {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  projection: MapProjection;
  network: RoadNetwork;
}

export interface VehicleRenderer {
  render: (vehicles: Map<string, Vehicle>, transform: d3.ZoomTransform) => void;
  clear: () => void;
}

/**
 * Create vehicle renderer
 */
export function createVehicleRenderer(config: VehicleRendererConfig): VehicleRenderer {
  const { canvas, ctx, projection, network } = config;

  // Pre-calculate segment coordinate caches for interpolation
  const segmentCoordCache = new Map<string, {
    coords: Array<[number, number]>;
    distances: number[];
    totalLength: number;
  }>();

  // Build coordinate cache for each segment
  for (const [id, segment] of network.segments) {
    const coords = segment.coordinates.map(c => projection.project(c));
    const distances: number[] = [0];
    let totalLength = 0;

    for (let i = 1; i < coords.length; i++) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      totalLength += Math.sqrt(dx * dx + dy * dy);
      distances.push(totalLength);
    }

    segmentCoordCache.set(id, { coords, distances, totalLength });
  }

  /**
   * Get screen position for a vehicle
   */
  function getVehicleScreenPosition(
    vehicle: Vehicle,
    transform: d3.ZoomTransform
  ): { x: number; y: number; angle: number } | null {
    const segment = network.segments.get(vehicle.segmentId);
    if (!segment) return null;

    const cache = segmentCoordCache.get(vehicle.segmentId);
    if (!cache || cache.coords.length < 2) return null;

    // Convert vehicle position (meters) to fraction of segment
    const fraction = Math.min(1, Math.max(0, vehicle.position / segment.length));
    const targetDist = fraction * cache.totalLength;

    // Find the two points to interpolate between
    let i = 0;
    while (i < cache.distances.length - 1 && cache.distances[i + 1] < targetDist) {
      i++;
    }

    if (i >= cache.coords.length - 1) {
      i = cache.coords.length - 2;
    }

    // Interpolate position
    const segmentDist = cache.distances[i + 1] - cache.distances[i];
    const t = segmentDist > 0 ? (targetDist - cache.distances[i]) / segmentDist : 0;

    const x1 = cache.coords[i][0];
    const y1 = cache.coords[i][1];
    const x2 = cache.coords[i + 1][0];
    const y2 = cache.coords[i + 1][1];

    const baseX = x1 + t * (x2 - x1);
    const baseY = y1 + t * (y2 - y1);

    // Calculate angle (direction of travel)
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Apply lane offset (perpendicular to road direction)
    // Road widths: motorway=24px with 3 lanes = 8px per lane
    const laneWidth = 8; // pixels per lane in projection space
    const laneOffset = (vehicle.lane - (segment.laneCount - 1) / 2) * laneWidth;

    const perpX = -Math.sin(angle) * laneOffset;
    const perpY = Math.cos(angle) * laneOffset;

    // Apply zoom transform (offset is already in projection space, so scales with transform)
    const screenX = transform.x + (baseX + perpX) * transform.k;
    const screenY = transform.y + (baseY + perpY) * transform.k;

    return { x: screenX, y: screenY, angle };
  }

  /**
   * Render all vehicles
   */
  function render(vehicles: Map<string, Vehicle>, transform: d3.ZoomTransform): void {
    // Clear canvas
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, width, height);

    // Scale factor for vehicle sizes
    const scale = Math.max(1, Math.min(2, transform.k));

    // Render each vehicle
    for (const vehicle of vehicles.values()) {
      const pos = getVehicleScreenPosition(vehicle, transform);
      if (!pos) continue;

      // Skip if outside viewport (with margin)
      if (pos.x < -20 || pos.x > width + 20 || pos.y < -20 || pos.y > height + 20) {
        continue;
      }

      const color = VEHICLE_COLORS[vehicle.type];
      const size = VEHICLE_SIZES[vehicle.type];

      // Draw vehicle as rounded rectangle
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(pos.angle + Math.PI / 2); // Rotate to face direction of travel

      const w = size.width * scale;
      const h = size.height * scale;

      // Vehicle body
      ctx.fillStyle = color;
      ctx.beginPath();
      roundRect(ctx, -w / 2, -h / 2, w, h, 1 * scale);
      ctx.fill();

      // Subtle highlight for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      roundRect(ctx, -w / 2, -h / 2, w, h / 3, 1 * scale);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Clear the canvas
   */
  function clear(): void {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, width, height);
  }

  return { render, clear };
}

/**
 * Draw rounded rectangle
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
