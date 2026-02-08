/**
 * Demand Generator
 *
 * Spawns vehicles at entry points based on demand configuration.
 * Handles vehicle type composition and respects policy restrictions.
 */

import type { Vehicle, VehicleType, DemandConfig, PolicyState } from '../types';
import { createVehicle, VEHICLE_PARAMS, getVehicleSpace } from '../types/vehicle';
import type { RoadNetwork, SimSegment } from './road-model';
import type { RandomGenerator } from './random';

/**
 * Spawn result
 */
export interface SpawnResult {
  /** Vehicles to add to simulation */
  vehicles: Vehicle[];
  /** Number of vehicles that couldn't spawn (no space) */
  blocked: number;
}

/**
 * Calculate vehicles to spawn this timestep
 */
export function calculateSpawnCount(
  demandConfig: DemandConfig,
  dt: number,
  accumulator: number
): { count: number; newAccumulator: number } {
  // Convert vehicles per hour to vehicles per second
  const vehiclesPerSecond = demandConfig.vehiclesPerHour / 3600;

  // Accumulate fractional vehicles
  const totalToSpawn = accumulator + vehiclesPerSecond * dt;

  // Spawn whole vehicles, keep fraction for next tick
  const count = Math.floor(totalToSpawn);
  const newAccumulator = totalToSpawn - count;

  return { count, newAccumulator };
}

/**
 * Select vehicle type based on composition
 */
export function selectVehicleType(
  composition: Record<VehicleType, number>,
  rng: RandomGenerator,
  restrictions?: { excludeTypes?: VehicleType[] }
): VehicleType {
  const types: VehicleType[] = ['car', 'taxi', 'bus', 'truck', 'motorbike'];
  const weights: number[] = [];

  for (const type of types) {
    if (restrictions?.excludeTypes?.includes(type)) {
      weights.push(0);
    } else {
      weights.push(composition[type] || 0);
    }
  }

  // Normalize weights
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) {
    // If all types excluded, default to car
    return 'car';
  }

  return rng.pickWeighted(types, weights);
}

/**
 * Select entry point for spawning
 */
export function selectEntryPoint(
  network: RoadNetwork,
  rng: RandomGenerator
): SimSegment | null {
  if (network.entryPoints.length === 0) {
    return null;
  }

  // Weight entry points by capacity (lane count)
  const segments: SimSegment[] = [];
  const weights: number[] = [];

  for (const entryId of network.entryPoints) {
    const segment = network.segments.get(entryId);
    if (segment) {
      // Prefer main corridor entries over ramps
      const weight = segment.isRamp ? 0.2 : 1.0;
      segments.push(segment);
      weights.push(weight * segment.laneCount);
    }
  }

  if (segments.length === 0) {
    return null;
  }

  return rng.pickWeighted(segments, weights);
}

/**
 * Select lane for spawning in a segment
 */
export function selectSpawnLane(
  segment: SimSegment,
  vehicleType: VehicleType,
  hovEnabled: boolean,
  rng: RandomGenerator
): number {
  const params = VEHICLE_PARAMS[vehicleType];
  const availableLanes: number[] = [];

  for (let i = 0; i < segment.laneCount; i++) {
    const lane = segment.lanes[i];
    if (!lane.isOpen) continue;

    // Check HOV restriction
    if (hovEnabled && lane.isHOV && !params.canUseHOV) continue;

    availableLanes.push(i);
  }

  if (availableLanes.length === 0) {
    // Fallback to rightmost lane
    return 0;
  }

  // Slight preference for right lanes for slower vehicles
  if (vehicleType === 'truck' || vehicleType === 'bus') {
    // Prefer rightmost available lanes
    const weights = availableLanes.map(
      (_, idx) => availableLanes.length - idx
    );
    return rng.pickWeighted(availableLanes, weights);
  }

  // Random lane for other vehicles
  return rng.pick(availableLanes);
}

/**
 * Check if there's space to spawn at position
 */
export function canSpawnAtPosition(
  segment: SimSegment,
  lane: number,
  position: number,
  existingVehicles: Vehicle[],
  vehicleType: VehicleType
): boolean {
  const params = VEHICLE_PARAMS[vehicleType];
  const requiredSpace = getVehicleSpace({ type: vehicleType } as Vehicle) * 2;

  for (const vehicle of existingVehicles) {
    if (vehicle.segmentId !== segment.id) continue;
    if (vehicle.lane !== lane) continue;

    // Check distance
    const distance = Math.abs(vehicle.position - position);
    if (distance < requiredSpace) {
      return false;
    }
  }

  return true;
}

/**
 * Check if truck restriction applies
 */
export function isTruckRestricted(
  policies: PolicyState,
  simulationTime: number
): boolean {
  if (!policies.truckRestriction.enabled) {
    return false;
  }

  // Convert simulation time to hour of day (assuming simulation starts at 06:00)
  const startHourOffset = 6;
  const hourOfDay = (startHourOffset + (simulationTime / 3600)) % 24;

  const { startHour, endHour } = policies.truckRestriction;

  // Handle overnight restrictions (e.g., 22:00 - 06:00)
  if (startHour <= endHour) {
    return hourOfDay >= startHour && hourOfDay < endHour;
  } else {
    return hourOfDay >= startHour || hourOfDay < endHour;
  }
}

/**
 * Spawn vehicles at entry points
 */
export function spawnVehicles(
  network: RoadNetwork,
  demandConfig: DemandConfig,
  policies: PolicyState,
  existingVehicles: Vehicle[],
  simulationTime: number,
  count: number,
  rng: RandomGenerator
): SpawnResult {
  const vehicles: Vehicle[] = [];
  let blocked = 0;

  // Determine excluded types based on policies
  const excludeTypes: VehicleType[] = [];

  if (isTruckRestricted(policies, simulationTime)) {
    if (policies.truckRestriction.effect === 'remove') {
      excludeTypes.push('truck');
    }
    // 'shift' and 'reroute' don't exclude, they just affect behavior
  }

  for (let i = 0; i < count; i++) {
    // Select entry point
    const entrySegment = selectEntryPoint(network, rng);
    if (!entrySegment) {
      blocked++;
      continue;
    }

    // Select vehicle type
    const vehicleType = selectVehicleType(
      demandConfig.composition,
      rng,
      { excludeTypes }
    );

    // Select lane
    const lane = selectSpawnLane(
      entrySegment,
      vehicleType,
      policies.hovLaneEnabled,
      rng
    );

    // Spawn position (at start of segment with some randomization)
    const position = rng.randFloat(0, 10);

    // Check if there's space
    if (!canSpawnAtPosition(entrySegment, lane, position, existingVehicles, vehicleType)) {
      blocked++;
      continue;
    }

    // Get speed limit for initial speed
    const speedLimit = entrySegment.speedLimit;

    // Create vehicle
    const vehicle = createVehicle(
      {
        type: vehicleType,
        segmentId: entrySegment.id,
        lane,
        position,
      },
      speedLimit,
      simulationTime
    );

    vehicles.push(vehicle);

    // Add to existing for next spawn check
    existingVehicles.push(vehicle);
  }

  return { vehicles, blocked };
}

/**
 * Generate demand curve for time-varying traffic
 * Returns multiplier (0-2) based on time of day
 */
export function getDemandMultiplier(simulationTime: number): number {
  // Convert to hour of day (starting at 06:00)
  const startHourOffset = 6;
  const hourOfDay = (startHourOffset + (simulationTime / 3600)) % 24;

  // Morning peak: 07:00 - 09:00
  if (hourOfDay >= 7 && hourOfDay < 9) {
    const peak = hourOfDay - 7;
    return 1.0 + 0.8 * Math.sin((peak / 2) * Math.PI);
  }

  // Evening peak: 17:00 - 19:00
  if (hourOfDay >= 17 && hourOfDay < 19) {
    const peak = hourOfDay - 17;
    return 1.0 + 0.6 * Math.sin((peak / 2) * Math.PI);
  }

  // Off-peak: lower demand
  if (hourOfDay >= 22 || hourOfDay < 6) {
    return 0.3;
  }

  // Normal daytime
  return 0.8;
}
