/**
 * Car-Following Model (IDM-lite)
 *
 * Implements a simplified Intelligent Driver Model for vehicle acceleration.
 * The IDM produces smooth, realistic acceleration/deceleration behavior.
 */

import type { Vehicle } from '../types';
import { getVehicleParams, getVehicleSpace } from '../types/vehicle';

/**
 * IDM parameters (can be tuned)
 */
export interface IDMParams {
  /** Time headway in seconds (desired time gap to leader) */
  timeHeadway: number;
  /** Acceleration exponent (higher = smoother acceleration) */
  delta: number;
}

const DEFAULT_IDM_PARAMS: IDMParams = {
  timeHeadway: 1.5,
  delta: 4,
};

/**
 * Leader vehicle information
 */
export interface LeaderInfo {
  /** Distance to leader's rear bumper in meters */
  gap: number;
  /** Leader's current speed in m/s */
  speed: number;
  /** Leader's length in meters */
  length: number;
}

/**
 * Calculate acceleration using the Intelligent Driver Model
 *
 * @param vehicle The following vehicle
 * @param leader Information about the leader (null if no leader)
 * @param speedLimit Current speed limit in m/s
 * @param weatherBrakingFactor Factor to increase safe distances (>1 for bad weather)
 * @returns Acceleration in m/s²
 */
export function calculateIDMAcceleration(
  vehicle: Vehicle,
  leader: LeaderInfo | null,
  speedLimit: number,
  weatherBrakingFactor: number = 1,
  idmParams: IDMParams = DEFAULT_IDM_PARAMS
): number {
  const params = getVehicleParams(vehicle);

  // Desired speed is minimum of vehicle's desired speed and current limit
  const v0 = Math.min(vehicle.desiredSpeed, speedLimit);
  const v = vehicle.speed;
  const a = params.maxAcceleration;
  const b = params.comfortDeceleration;
  const s0 = params.minGap * weatherBrakingFactor;
  const T = idmParams.timeHeadway * weatherBrakingFactor;
  const delta = idmParams.delta;

  // Free road acceleration (no leader)
  const freeAccel = a * (1 - Math.pow(v / v0, delta));

  if (!leader) {
    // No leader: accelerate towards desired speed
    return clampAcceleration(freeAccel, params.maxAcceleration, params.maxDeceleration);
  }

  // Calculate desired minimum gap (s*)
  const dv = v - leader.speed; // Approach rate
  const s = leader.gap;

  // Desired minimum gap: s* = s0 + v*T + v*dv / (2*sqrt(a*b))
  const sStar = s0 + Math.max(0, v * T + (v * dv) / (2 * Math.sqrt(a * b)));

  // IDM acceleration
  const interactionTerm = Math.pow(sStar / Math.max(s, 0.1), 2);
  const accel = a * (1 - Math.pow(v / v0, delta) - interactionTerm);

  return clampAcceleration(accel, params.maxAcceleration, params.maxDeceleration);
}

/**
 * Calculate safe distance to maintain behind leader
 */
export function calculateSafeDistance(
  followerSpeed: number,
  leaderSpeed: number,
  minGap: number,
  reactionTime: number,
  comfortDecel: number,
  weatherFactor: number = 1
): number {
  const T = reactionTime * weatherFactor;
  const s0 = minGap * weatherFactor;

  // Simple time-based safe distance
  return s0 + followerSpeed * T;
}

/**
 * Check if following distance is safe
 */
export function isSafeDistance(
  gap: number,
  followerSpeed: number,
  leaderSpeed: number,
  minGap: number,
  reactionTime: number,
  weatherFactor: number = 1
): boolean {
  const safeGap = calculateSafeDistance(
    followerSpeed,
    leaderSpeed,
    minGap,
    reactionTime,
    2.0, // Use comfort decel
    weatherFactor
  );

  return gap >= safeGap * 0.8; // 80% of safe distance is acceptable
}

/**
 * Calculate emergency braking deceleration
 */
export function calculateEmergencyBraking(
  vehicle: Vehicle,
  obstacleDistance: number,
  obstacleSpeed: number = 0
): number {
  const params = getVehicleParams(vehicle);
  const v = vehicle.speed;
  const dv = v - obstacleSpeed;

  if (dv <= 0 || obstacleDistance <= 0) {
    return 0; // Not approaching
  }

  // Deceleration needed to stop before obstacle
  // Using v² = u² + 2as, solve for a: a = (v² - u²) / 2s
  // For stopping: a = v² / 2s
  const requiredDecel = (dv * dv) / (2 * Math.max(obstacleDistance, 0.1));

  // Use maximum braking if needed
  if (requiredDecel > params.comfortDeceleration) {
    return -Math.min(requiredDecel, params.maxDeceleration);
  }

  return -requiredDecel;
}

/**
 * Clamp acceleration to vehicle limits
 */
function clampAcceleration(accel: number, maxAccel: number, maxDecel: number): number {
  return Math.max(-maxDecel, Math.min(maxAccel, accel));
}

/**
 * Update vehicle speed and position based on acceleration
 */
export function updateVehicleKinematics(
  vehicle: Vehicle,
  acceleration: number,
  dt: number
): { newSpeed: number; newPosition: number; distanceTraveled: number } {
  const params = getVehicleParams(vehicle);

  // Update speed with clamping
  let newSpeed = vehicle.speed + acceleration * dt;
  newSpeed = Math.max(0, Math.min(newSpeed, params.maxSpeed));

  // Update position (using average speed for smoother motion)
  const avgSpeed = (vehicle.speed + newSpeed) / 2;
  const distanceTraveled = avgSpeed * dt;
  const newPosition = vehicle.position + distanceTraveled;

  return { newSpeed, newPosition, distanceTraveled };
}

/**
 * Find the leader vehicle in the same lane
 */
export function findLeader(
  vehicle: Vehicle,
  vehiclesInLane: Vehicle[]
): LeaderInfo | null {
  let closestLeader: Vehicle | null = null;
  let closestDistance = Infinity;

  for (const other of vehiclesInLane) {
    if (other.id === vehicle.id) continue;

    // Leader is ahead of us (higher position in same segment)
    if (other.position > vehicle.position) {
      const distance = other.position - vehicle.position - getVehicleSpace(other);

      if (distance < closestDistance && distance > 0) {
        closestDistance = distance;
        closestLeader = other;
      }
    }
  }

  if (!closestLeader) {
    return null;
  }

  const leaderParams = getVehicleParams(closestLeader);

  return {
    gap: closestDistance,
    speed: closestLeader.speed,
    length: leaderParams.length,
  };
}

/**
 * Find vehicles in adjacent lane for lane change safety check
 */
export function findAdjacentVehicles(
  vehicle: Vehicle,
  targetLane: number,
  allVehicles: Vehicle[],
  segmentId: string
): { ahead: LeaderInfo | null; behind: LeaderInfo | null } {
  const vehiclesInTargetLane = allVehicles.filter(
    v => v.segmentId === segmentId && v.lane === targetLane && v.id !== vehicle.id
  );

  let ahead: Vehicle | null = null;
  let behind: Vehicle | null = null;
  let aheadDist = Infinity;
  let behindDist = Infinity;

  for (const other of vehiclesInTargetLane) {
    const dist = other.position - vehicle.position;

    if (dist > 0 && dist < aheadDist) {
      aheadDist = dist;
      ahead = other;
    } else if (dist < 0 && -dist < behindDist) {
      behindDist = -dist;
      behind = other;
    }
  }

  const aheadInfo: LeaderInfo | null = ahead
    ? {
        gap: aheadDist - getVehicleSpace(ahead),
        speed: ahead.speed,
        length: getVehicleParams(ahead).length,
      }
    : null;

  const behindInfo: LeaderInfo | null = behind
    ? {
        gap: behindDist - getVehicleSpace(vehicle),
        speed: behind.speed,
        length: getVehicleParams(behind).length,
      }
    : null;

  return { ahead: aheadInfo, behind: behindInfo };
}
