/**
 * Road Model for Simulation
 *
 * Converts GeoJSON road data into a simulation-ready graph structure
 * with directed segments and lane information.
 */

import type { RoadFeatureCollection, RoadFeature } from '../types';
import { polylineLength } from '../utils/geometry';

/**
 * Lane state for simulation
 */
export interface LaneState {
  /** Lane index (0 = rightmost) */
  index: number;
  /** Whether lane is open */
  isOpen: boolean;
  /** Whether this is an HOV lane */
  isHOV: boolean;
  /** Speed limit for this lane (m/s) */
  speedLimit: number;
}

/**
 * Simulation segment - represents a directed road segment
 */
export interface SimSegment {
  /** Unique segment ID */
  id: string;
  /** Original feature ID from GeoJSON */
  featureId: string;
  /** Segment name */
  name?: string;
  /** Road reference (e.g., A1) */
  ref?: string;
  /** Coordinates [lon, lat] for rendering */
  coordinates: Array<[number, number]>;
  /** Length in meters */
  length: number;
  /** Number of lanes */
  laneCount: number;
  /** Lane states */
  lanes: LaneState[];
  /** Base speed limit in m/s */
  speedLimit: number;
  /** Is this a ramp? */
  isRamp: boolean;
  /** Ramp type if applicable */
  rampType?: 'on' | 'off';
  /** Connected segments downstream (vehicles exit to these) */
  downstream: string[];
  /** Connected segments upstream (vehicles enter from these) */
  upstream: string[];
  /** Entry point for spawning (only true for corridor entry segments) */
  isEntry: boolean;
  /** Exit point (only true for corridor exit segments) */
  isExit: boolean;
  /** Cumulative distance from corridor start in meters */
  cumulativeDistance: number;
}

/**
 * Road network for simulation
 */
export interface RoadNetwork {
  /** All segments indexed by ID */
  segments: Map<string, SimSegment>;
  /** Entry segment IDs (where vehicles spawn) */
  entryPoints: string[];
  /** Exit segment IDs (where vehicles leave) */
  exitPoints: string[];
  /** Total corridor length in meters */
  totalLength: number;
  /** Ordered list of main corridor segment IDs (for metrics) */
  mainCorridorSegments: string[];
}

/**
 * Build road network from GeoJSON data
 */
export function buildRoadNetwork(data: RoadFeatureCollection): RoadNetwork {
  const segments = new Map<string, SimSegment>();
  let entryPoints: string[] = [];
  let exitPoints: string[] = [];
  const mainCorridorSegments: string[] = [];

  // First pass: create segments
  for (const feature of data.features) {
    const segment = createSegmentFromFeature(feature);
    segments.set(segment.id, segment);

    // Track main corridor segments (motorways, non-ramps)
    if (!segment.isRamp && (feature.properties.roadType === 'motorway' || feature.properties.roadType === 'trunk')) {
      mainCorridorSegments.push(segment.id);
    }
  }

  // Second pass: connect segments based on proximity
  connectSegments(segments);

  // Third pass: identify entry and exit points
  for (const segment of segments.values()) {
    // Entry: segments with no upstream
    if (segment.upstream.length === 0) {
      segment.isEntry = true;
      entryPoints.push(segment.id);
    }
    // Also mark on-ramps as entry
    if (segment.isRamp && segment.rampType === 'on') {
      segment.isEntry = true;
      if (!entryPoints.includes(segment.id)) {
        entryPoints.push(segment.id);
      }
    }

    // Exit: segments with no downstream
    if (segment.downstream.length === 0) {
      segment.isExit = true;
      exitPoints.push(segment.id);
    }
    // Also mark off-ramps as exit
    if (segment.isRamp && segment.rampType === 'off') {
      segment.isExit = true;
      if (!exitPoints.includes(segment.id)) {
        exitPoints.push(segment.id);
      }
    }
  }

  // FALLBACK: If few natural entry points, add northernmost motorway segments
  if (entryPoints.length < 3 && mainCorridorSegments.length > 0) {
    console.log('Adding northernmost segments as entry points');

    // Sort by starting latitude (north = higher lat)
    const sortedByLat = [...mainCorridorSegments].sort((a, b) => {
      const segA = segments.get(a);
      const segB = segments.get(b);
      if (!segA || !segB) return 0;
      return segB.coordinates[0][1] - segA.coordinates[0][1];
    });

    // Take top 2 northernmost segments as entry points
    const topN = Math.min(2, sortedByLat.length);
    for (let i = 0; i < topN; i++) {
      const seg = segments.get(sortedByLat[i]);
      if (seg && !entryPoints.includes(seg.id)) {
        seg.isEntry = true;
        entryPoints.push(seg.id);
      }
    }
  }

  // FALLBACK: If still no entry points, just use any motorway segments
  if (entryPoints.length === 0 && segments.size > 0) {
    console.log('Still no entry points, using first available segments');
    let count = 0;
    for (const segment of segments.values()) {
      if (!segment.isRamp && count < 2) {
        segment.isEntry = true;
        entryPoints.push(segment.id);
        count++;
      }
    }
  }

  // FALLBACK: If few natural exit points, add southernmost segments
  if (exitPoints.length < 3 && mainCorridorSegments.length > 0) {
    const sortedByLat = [...mainCorridorSegments].sort((a, b) => {
      const segA = segments.get(a);
      const segB = segments.get(b);
      if (!segA || !segB) return 0;
      return segA.coordinates[0][1] - segB.coordinates[0][1]; // South = lower lat
    });

    const topN = Math.min(2, sortedByLat.length);
    for (let i = 0; i < topN; i++) {
      const seg = segments.get(sortedByLat[i]);
      if (seg && !exitPoints.includes(seg.id)) {
        seg.isExit = true;
        exitPoints.push(seg.id);
      }
    }
  }

  // Calculate cumulative distances for main corridor
  sortAndCalculateDistances(segments, mainCorridorSegments);

  // Calculate total length
  const totalLength = mainCorridorSegments.reduce((sum, id) => {
    const seg = segments.get(id);
    return sum + (seg?.length ?? 0);
  }, 0);

  console.log(`Road network: ${segments.size} segments, ${entryPoints.length} entries, ${exitPoints.length} exits`);

  return {
    segments,
    entryPoints,
    exitPoints,
    totalLength: totalLength || 20000, // Default 20km if calculation fails
    mainCorridorSegments,
  };
}

/**
 * Create a simulation segment from a GeoJSON feature
 */
function createSegmentFromFeature(feature: RoadFeature): SimSegment {
  const props = feature.properties;
  const speedLimit = (props.maxSpeed || 120) / 3.6; // Convert km/h to m/s

  // Create lane states
  const lanes: LaneState[] = [];
  for (let i = 0; i < props.lanes; i++) {
    lanes.push({
      index: i,
      isOpen: true,
      isHOV: i === props.lanes - 1, // Leftmost lane can be HOV
      speedLimit,
    });
  }

  return {
    id: props.id,
    featureId: String(feature.id),
    name: props.name,
    ref: props.ref,
    coordinates: feature.geometry.coordinates,
    length: props.length || polylineLength(feature.geometry.coordinates),
    laneCount: props.lanes,
    lanes,
    speedLimit,
    isRamp: props.isRamp,
    rampType: props.rampType,
    downstream: [],
    upstream: [],
    isEntry: false,
    isExit: false,
    cumulativeDistance: 0,
  };
}

/**
 * Connect segments based on endpoint proximity
 */
function connectSegments(segments: Map<string, SimSegment>): void {
  // Increased threshold for better connectivity (~100m in degrees)
  const CONNECT_THRESHOLD = 0.001;

  const segmentArray = Array.from(segments.values());

  for (const seg of segmentArray) {
    const endPoint = seg.coordinates[seg.coordinates.length - 1];

    for (const other of segmentArray) {
      if (seg.id === other.id) continue;

      // Check if end of seg connects to start of other
      const otherStart = other.coordinates[0];
      const distanceToStart = Math.sqrt(
        (endPoint[0] - otherStart[0]) ** 2 +
        (endPoint[1] - otherStart[1]) ** 2
      );

      if (distanceToStart < CONNECT_THRESHOLD) {
        // Connect: seg -> other
        if (!seg.downstream.includes(other.id)) {
          seg.downstream.push(other.id);
        }
        if (!other.upstream.includes(seg.id)) {
          other.upstream.push(seg.id);
        }
      }
    }
  }

  // Second pass: Build chains for disconnected segments
  // Find segments with no downstream and connect them to nearest downstream candidate
  for (const seg of segmentArray) {
    if (seg.downstream.length === 0 && !seg.isRamp) {
      const endPoint = seg.coordinates[seg.coordinates.length - 1];
      let bestCandidate: SimSegment | null = null;
      let bestDistance = 0.005; // Max 500m search radius

      for (const other of segmentArray) {
        if (seg.id === other.id) continue;
        if (seg.upstream.includes(other.id)) continue; // Don't create cycles

        // Only connect to segments that continue southward (lower latitude)
        const otherStart = other.coordinates[0];
        if (otherStart[1] > endPoint[1]) continue; // Other starts north of our end

        const distance = Math.sqrt(
          (endPoint[0] - otherStart[0]) ** 2 +
          (endPoint[1] - otherStart[1]) ** 2
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestCandidate = other;
        }
      }

      if (bestCandidate) {
        seg.downstream.push(bestCandidate.id);
        bestCandidate.upstream.push(seg.id);
      }
    }
  }
}

/**
 * Sort main corridor segments and calculate cumulative distances
 */
function sortAndCalculateDistances(
  segments: Map<string, SimSegment>,
  mainCorridorSegments: string[]
): void {
  // Sort by starting latitude (north to south for Kifissia->Faliro)
  mainCorridorSegments.sort((a, b) => {
    const segA = segments.get(a);
    const segB = segments.get(b);
    if (!segA || !segB) return 0;
    // Higher latitude = more north = comes first
    return segB.coordinates[0][1] - segA.coordinates[0][1];
  });

  // Calculate cumulative distances
  let cumulative = 0;
  for (const id of mainCorridorSegments) {
    const segment = segments.get(id);
    if (segment) {
      segment.cumulativeDistance = cumulative;
      cumulative += segment.length;
    }
  }
}

/**
 * Get effective speed limit for a segment considering weather and policies
 */
export function getEffectiveSpeedLimit(
  segment: SimSegment,
  weatherFactor: number = 1,
  dynamicLimit?: number
): number {
  let limit = segment.speedLimit;

  // Apply dynamic limit if set
  if (dynamicLimit !== undefined) {
    limit = Math.min(limit, dynamicLimit);
  }

  // Apply weather factor
  limit *= weatherFactor;

  return limit;
}

/**
 * Get available lanes for a vehicle type at a position
 */
export function getAvailableLanes(
  segment: SimSegment,
  canUseHOV: boolean,
  hovEnabled: boolean,
  closedLanes: number[] = []
): number[] {
  const available: number[] = [];

  for (const lane of segment.lanes) {
    // Skip closed lanes
    if (closedLanes.includes(lane.index)) continue;
    if (!lane.isOpen) continue;

    // Check HOV restriction
    if (hovEnabled && lane.isHOV && !canUseHOV) continue;

    available.push(lane.index);
  }

  return available;
}

/**
 * Check if a lane is blocked at a position due to accident
 */
export function isLaneBlockedByAccident(
  segmentId: string,
  lane: number,
  position: number,
  accidents: Array<{ segmentId: string; position: number; lanesBlocked: number[] }>
): boolean {
  for (const accident of accidents) {
    if (accident.segmentId === segmentId && accident.lanesBlocked.includes(lane)) {
      // Accident blocks a zone around its position (e.g., 50m before and after)
      const accidentZone = 50;
      if (Math.abs(position - accident.position) < accidentZone) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get position along the full corridor from segment position
 */
export function getCorridorPosition(segment: SimSegment, positionInSegment: number): number {
  return segment.cumulativeDistance + positionInSegment;
}

/**
 * Find segment containing a corridor position
 */
export function findSegmentAtPosition(
  network: RoadNetwork,
  corridorPosition: number
): { segment: SimSegment; positionInSegment: number } | null {
  for (const id of network.mainCorridorSegments) {
    const segment = network.segments.get(id);
    if (!segment) continue;

    const segmentEnd = segment.cumulativeDistance + segment.length;
    if (corridorPosition >= segment.cumulativeDistance && corridorPosition < segmentEnd) {
      return {
        segment,
        positionInSegment: corridorPosition - segment.cumulativeDistance,
      };
    }
  }
  return null;
}
