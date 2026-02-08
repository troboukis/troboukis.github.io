/**
 * Lane Changing Model
 *
 * Implements MOBIL-inspired lane changing with safety checks.
 * Lane changes are probabilistic with incentive and safety criteria.
 */

import type { Vehicle } from '../types';
import { getVehicleParams } from '../types/vehicle';
import {
  calculateIDMAcceleration,
  findAdjacentVehicles,
  findLeader,
  type LeaderInfo,
} from './car-following';
import type { RandomGenerator } from './random';
import type { SimSegment } from './road-model';

/**
 * Lane change decision result
 */
export interface LaneChangeDecision {
  /** Whether to change lanes */
  shouldChange: boolean;
  /** Target lane index (-1 if not changing) */
  targetLane: number;
  /** Reason for decision */
  reason: 'none' | 'faster' | 'slower_blocking' | 'mandatory' | 'unsafe' | 'no_benefit';
}

/**
 * Lane change parameters
 */
export interface LaneChangeParams {
  /** Minimum safe gap ahead in target lane (meters) */
  minGapAhead: number;
  /** Minimum safe gap behind in target lane (meters) */
  minGapBehind: number;
  /** Minimum acceleration advantage to change (m/s²) */
  minAccelAdvantage: number;
  /** Politeness factor (0-1, higher = more considerate of followers) */
  politeness: number;
  /** Safe deceleration threshold for following vehicle (m/s²) */
  safeDecelThreshold: number;
  /** Cooldown time between lane changes (seconds) */
  laneChangeCooldown: number;
}

const DEFAULT_LANE_CHANGE_PARAMS: LaneChangeParams = {
  minGapAhead: 10,
  minGapBehind: 8,
  minAccelAdvantage: 0.2,
  politeness: 0.5,
  safeDecelThreshold: 3.0,
  laneChangeCooldown: 2.0,
};

/**
 * Evaluate whether a lane change is beneficial and safe
 */
export function evaluateLaneChange(
  vehicle: Vehicle,
  currentLane: number,
  targetLane: number,
  segment: SimSegment,
  allVehicles: Vehicle[],
  speedLimit: number,
  weatherFactor: number = 1,
  rng: RandomGenerator,
  params: LaneChangeParams = DEFAULT_LANE_CHANGE_PARAMS
): LaneChangeDecision {
  const vehicleParams = getVehicleParams(vehicle);

  // Check if target lane is valid
  if (targetLane < 0 || targetLane >= segment.laneCount) {
    return { shouldChange: false, targetLane: -1, reason: 'none' };
  }

  // Check if lane is open
  if (!segment.lanes[targetLane].isOpen) {
    return { shouldChange: false, targetLane: -1, reason: 'none' };
  }

  // Get vehicles in current and target lanes
  const vehiclesInCurrentLane = allVehicles.filter(
    v => v.segmentId === segment.id && v.lane === currentLane
  );
  const vehiclesInTargetLane = allVehicles.filter(
    v => v.segmentId === segment.id && v.lane === targetLane
  );

  // Find leaders and followers
  const currentLeader = findLeader(vehicle, vehiclesInCurrentLane);
  const { ahead: targetAhead, behind: targetBehind } = findAdjacentVehicles(
    vehicle,
    targetLane,
    allVehicles,
    segment.id
  );

  // Safety check: minimum gaps
  const adjustedMinGapAhead = params.minGapAhead * weatherFactor;
  const adjustedMinGapBehind = params.minGapBehind * weatherFactor;

  if (targetAhead && targetAhead.gap < adjustedMinGapAhead) {
    return { shouldChange: false, targetLane: -1, reason: 'unsafe' };
  }

  if (targetBehind && targetBehind.gap < adjustedMinGapBehind) {
    return { shouldChange: false, targetLane: -1, reason: 'unsafe' };
  }

  // Calculate acceleration in current lane
  const accelCurrent = calculateIDMAcceleration(
    vehicle,
    currentLeader,
    speedLimit,
    weatherFactor
  );

  // Calculate acceleration in target lane
  const accelTarget = calculateIDMAcceleration(
    vehicle,
    targetAhead,
    speedLimit,
    weatherFactor
  );

  // Check if change is beneficial
  const accelAdvantage = accelTarget - accelCurrent;

  if (accelAdvantage < params.minAccelAdvantage) {
    // No significant benefit, but might still change with low probability
    if (!rng.randBool(0.05 * (1 - vehicleParams.politeness))) {
      return { shouldChange: false, targetLane: -1, reason: 'no_benefit' };
    }
  }

  // MOBIL safety criterion: check impact on following vehicle in target lane
  if (targetBehind) {
    // Calculate follower's deceleration if we move in
    const followerDecelWithUs = calculateFollowerDecel(
      targetBehind,
      vehicle,
      speedLimit,
      weatherFactor
    );

    if (followerDecelWithUs > params.safeDecelThreshold) {
      return { shouldChange: false, targetLane: -1, reason: 'unsafe' };
    }

    // Politeness criterion
    const politenessAdjustment = vehicleParams.politeness * followerDecelWithUs;
    if (accelAdvantage < politenessAdjustment) {
      // Not worth inconveniencing follower
      if (!rng.randBool(0.1)) {
        return { shouldChange: false, targetLane: -1, reason: 'no_benefit' };
      }
    }
  }

  // Add randomness to prevent synchronized lane changes
  const changeProbability = calculateChangeProbability(
    accelAdvantage,
    vehicleParams.laneChangeThreshold
  );

  if (!rng.randBool(changeProbability)) {
    return { shouldChange: false, targetLane: -1, reason: 'none' };
  }

  // Decision to change
  const reason = accelAdvantage > 0.5 ? 'faster' : 'slower_blocking';
  return { shouldChange: true, targetLane, reason };
}

/**
 * Calculate follower's required deceleration if we merge in front
 */
function calculateFollowerDecel(
  followerInfo: LeaderInfo,
  mergingVehicle: Vehicle,
  speedLimit: number,
  weatherFactor: number
): number {
  const mergingParams = getVehicleParams(mergingVehicle);

  // Create virtual leader info (the merging vehicle)
  const virtualLeader: LeaderInfo = {
    gap: followerInfo.gap - mergingParams.length,
    speed: mergingVehicle.speed,
    length: mergingParams.length,
  };

  // Create a virtual follower vehicle for acceleration calculation
  const virtualFollower: Vehicle = {
    id: 'virtual',
    type: 'car',
    segmentId: mergingVehicle.segmentId,
    position: 0,
    lane: 0,
    speed: followerInfo.speed,
    acceleration: 0,
    desiredSpeed: speedLimit,
    timeInSimulation: 0,
    distanceTraveled: 0,
    targetLane: -1,
    isExiting: false,
    entryTime: 0,
  };

  // Calculate acceleration (negative means deceleration)
  const accel = calculateIDMAcceleration(
    virtualFollower,
    virtualLeader,
    speedLimit,
    weatherFactor
  );

  return Math.max(0, -accel); // Return positive deceleration
}

/**
 * Calculate probability of lane change based on advantage
 */
function calculateChangeProbability(accelAdvantage: number, threshold: number): number {
  // Sigmoid-like function: higher advantage = higher probability
  if (accelAdvantage <= 0) return 0.05;
  if (accelAdvantage >= 2.0) return 0.9;

  const x = (accelAdvantage - threshold) / 0.5;
  return 0.1 + 0.8 / (1 + Math.exp(-x));
}

/**
 * Determine best lane change direction
 */
export function determineLaneChangeDirection(
  vehicle: Vehicle,
  segment: SimSegment,
  allVehicles: Vehicle[],
  speedLimit: number,
  availableLanes: number[],
  weatherFactor: number,
  rng: RandomGenerator
): LaneChangeDecision {
  const currentLane = vehicle.lane;

  // Possible target lanes (adjacent only)
  const possibleTargets = availableLanes.filter(
    lane => Math.abs(lane - currentLane) === 1
  );

  if (possibleTargets.length === 0) {
    return { shouldChange: false, targetLane: -1, reason: 'none' };
  }

  // Evaluate each possible lane change
  const decisions: Array<{ decision: LaneChangeDecision; advantage: number }> = [];

  for (const targetLane of possibleTargets) {
    const decision = evaluateLaneChange(
      vehicle,
      currentLane,
      targetLane,
      segment,
      allVehicles,
      speedLimit,
      weatherFactor,
      rng
    );

    if (decision.shouldChange) {
      // Calculate advantage for prioritization
      const vehiclesInTarget = allVehicles.filter(
        v => v.segmentId === segment.id && v.lane === targetLane
      );
      const leader = findLeader(vehicle, vehiclesInTarget);
      const advantage = leader ? leader.gap : 1000;

      decisions.push({ decision, advantage });
    }
  }

  if (decisions.length === 0) {
    return { shouldChange: false, targetLane: -1, reason: 'none' };
  }

  // Sort by advantage and pick best
  decisions.sort((a, b) => b.advantage - a.advantage);
  return decisions[0].decision;
}

/**
 * Check if lane change is mandatory (e.g., approaching closed lane, ramp)
 */
export function isMandatoryLaneChange(
  vehicle: Vehicle,
  segment: SimSegment,
  closedLanes: number[],
  isExitingAtRamp: boolean
): { mandatory: boolean; targetDirection: 'left' | 'right' | null } {
  const currentLane = vehicle.lane;

  // Check if current lane will be closed ahead
  if (closedLanes.includes(currentLane)) {
    // Need to move to an open lane
    const targetDirection = currentLane === 0 ? 'left' : 'right';
    return { mandatory: true, targetDirection };
  }

  // If exiting at ramp, need to be in rightmost lane
  if (isExitingAtRamp && currentLane > 0) {
    return { mandatory: true, targetDirection: 'right' };
  }

  return { mandatory: false, targetDirection: null };
}

/**
 * Execute lane change (update vehicle state)
 */
export function executeLaneChange(
  vehicle: Vehicle,
  targetLane: number
): void {
  vehicle.lane = targetLane;
  vehicle.targetLane = -1;
}
