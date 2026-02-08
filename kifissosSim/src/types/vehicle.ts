/**
 * Vehicle types and agent definitions for the traffic simulation
 */

/**
 * Vehicle types supported in the simulation
 */
export type VehicleType = 'car' | 'taxi' | 'bus' | 'truck' | 'motorbike';

/**
 * Vehicle parameters by type
 * These define the physical and behavioral characteristics of each vehicle type
 */
export interface VehicleParams {
  /** Vehicle length in meters */
  length: number;
  /** Maximum speed in m/s */
  maxSpeed: number;
  /** Desired speed as fraction of speed limit (0-1) */
  desiredSpeedFactor: number;
  /** Maximum acceleration in m/s² */
  maxAcceleration: number;
  /** Comfortable deceleration in m/s² */
  comfortDeceleration: number;
  /** Maximum braking deceleration in m/s² */
  maxDeceleration: number;
  /** Minimum gap to vehicle ahead in meters */
  minGap: number;
  /** Reaction time in seconds */
  reactionTime: number;
  /** Politeness factor for lane changing (0-1, higher = more polite) */
  politeness: number;
  /** Lane change threshold (higher = less likely to change) */
  laneChangeThreshold: number;
  /** Can use HOV lane */
  canUseHOV: boolean;
  /** Display color for rendering */
  color: string;
}

/**
 * Default parameters for each vehicle type
 */
export const VEHICLE_PARAMS: Record<VehicleType, VehicleParams> = {
  car: {
    length: 4.5,
    maxSpeed: 180 / 3.6, // 180 km/h -> m/s
    desiredSpeedFactor: 1.0,
    maxAcceleration: 3.0,
    comfortDeceleration: 2.0,
    maxDeceleration: 8.0,
    minGap: 2.0,
    reactionTime: 1.0,
    politeness: 0.5,
    laneChangeThreshold: 0.2,
    canUseHOV: false, // Unless carpool, handled separately
    color: '#4A90D9',
  },
  taxi: {
    length: 4.8,
    maxSpeed: 160 / 3.6,
    desiredSpeedFactor: 0.95,
    maxAcceleration: 2.5,
    comfortDeceleration: 2.0,
    maxDeceleration: 7.5,
    minGap: 2.5,
    reactionTime: 1.0,
    politeness: 0.4,
    laneChangeThreshold: 0.15,
    canUseHOV: true,
    color: '#F1C40F',
  },
  bus: {
    length: 12.0,
    maxSpeed: 100 / 3.6,
    desiredSpeedFactor: 0.85,
    maxAcceleration: 1.2,
    comfortDeceleration: 1.5,
    maxDeceleration: 5.0,
    minGap: 4.0,
    reactionTime: 1.5,
    politeness: 0.7,
    laneChangeThreshold: 0.4,
    canUseHOV: true,
    color: '#27AE60',
  },
  truck: {
    length: 16.0,
    maxSpeed: 90 / 3.6,
    desiredSpeedFactor: 0.8,
    maxAcceleration: 0.8,
    comfortDeceleration: 1.2,
    maxDeceleration: 4.0,
    minGap: 5.0,
    reactionTime: 1.8,
    politeness: 0.8,
    laneChangeThreshold: 0.5,
    canUseHOV: false,
    color: '#E74C3C',
  },
  motorbike: {
    length: 2.2,
    maxSpeed: 200 / 3.6,
    desiredSpeedFactor: 1.1,
    maxAcceleration: 4.0,
    comfortDeceleration: 3.0,
    maxDeceleration: 9.0,
    minGap: 1.5,
    reactionTime: 0.8,
    politeness: 0.3,
    laneChangeThreshold: 0.1,
    canUseHOV: true,
    color: '#9B59B6',
  },
};

/**
 * Vehicle state in the simulation
 */
export interface Vehicle {
  /** Unique identifier */
  id: string;
  /** Vehicle type */
  type: VehicleType;
  /** Current segment ID */
  segmentId: string;
  /** Position along segment in meters from start */
  position: number;
  /** Current lane index (0 = rightmost) */
  lane: number;
  /** Current speed in m/s */
  speed: number;
  /** Current acceleration in m/s² */
  acceleration: number;
  /** Desired speed in m/s (based on speed limit and vehicle type) */
  desiredSpeed: number;
  /** Time since entering simulation in seconds */
  timeInSimulation: number;
  /** Total distance traveled in meters */
  distanceTraveled: number;
  /** Target lane for lane change (-1 if not changing) */
  targetLane: number;
  /** Whether vehicle is waiting to exit (at ramp) */
  isExiting: boolean;
  /** Entry time (simulation time when vehicle entered) */
  entryTime: number;
}

/**
 * Vehicle creation parameters
 */
export interface VehicleSpawnParams {
  type: VehicleType;
  segmentId: string;
  lane: number;
  speed?: number;
  position?: number;
}

/**
 * Generate a unique vehicle ID
 */
let vehicleIdCounter = 0;
export function generateVehicleId(): string {
  return `v_${++vehicleIdCounter}`;
}

/**
 * Reset vehicle ID counter (for testing)
 */
export function resetVehicleIdCounter(): void {
  vehicleIdCounter = 0;
}

/**
 * Create a new vehicle with default state
 */
export function createVehicle(
  params: VehicleSpawnParams,
  speedLimit: number,
  simulationTime: number
): Vehicle {
  const vehicleParams = VEHICLE_PARAMS[params.type];
  const desiredSpeed = Math.min(
    speedLimit * vehicleParams.desiredSpeedFactor,
    vehicleParams.maxSpeed
  );

  return {
    id: generateVehicleId(),
    type: params.type,
    segmentId: params.segmentId,
    position: params.position ?? 0,
    lane: params.lane,
    speed: params.speed ?? desiredSpeed * 0.9,
    acceleration: 0,
    desiredSpeed,
    timeInSimulation: 0,
    distanceTraveled: 0,
    targetLane: -1,
    isExiting: false,
    entryTime: simulationTime,
  };
}

/**
 * Get vehicle parameters for a vehicle
 */
export function getVehicleParams(vehicle: Vehicle): VehicleParams {
  return VEHICLE_PARAMS[vehicle.type];
}

/**
 * Calculate the space occupied by a vehicle (length + min gap)
 */
export function getVehicleSpace(vehicle: Vehicle): number {
  const params = getVehicleParams(vehicle);
  return params.length + params.minGap;
}
