/**
 * Simulation Engine Module
 *
 * Microscopic traffic simulation for Kifissos corridor.
 */

export const SIMULATION_VERSION = '2.0.0';

// Road model
export { buildRoadNetwork, getEffectiveSpeedLimit, getAvailableLanes } from './road-model';
export type { SimSegment, LaneState, RoadNetwork } from './road-model';

// Random number generator
export { createRNG, generateSeed } from './random';
export type { RandomGenerator } from './random';

// Car-following model
export {
  calculateIDMAcceleration,
  calculateSafeDistance,
  isSafeDistance,
  updateVehicleKinematics,
  findLeader,
  findAdjacentVehicles,
} from './car-following';
export type { IDMParams, LeaderInfo } from './car-following';

// Lane changing
export {
  evaluateLaneChange,
  determineLaneChangeDirection,
  isMandatoryLaneChange,
  executeLaneChange,
} from './lane-changing';
export type { LaneChangeDecision, LaneChangeParams } from './lane-changing';

// Demand generation
export {
  calculateSpawnCount,
  selectVehicleType,
  spawnVehicles,
  getDemandMultiplier,
  isTruckRestricted,
} from './demand-generator';
export type { SpawnResult } from './demand-generator';

// Simulation engine
export { createSimulationEngine } from './engine';
export type { SimulationEngine } from './engine';
