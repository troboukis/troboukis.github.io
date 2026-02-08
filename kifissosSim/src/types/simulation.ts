/**
 * Simulation state and configuration types
 */

import type { VehicleType, Vehicle } from './vehicle';

/**
 * Scenario types
 */
export type ScenarioType = 'normal' | 'accident' | 'rain';

/**
 * Traffic policy state
 */
export interface PolicyState {
  /** HOV lane enabled (leftmost lane restricted) */
  hovLaneEnabled: boolean;
  /** Which vehicle types can use HOV lane */
  hovAllowedTypes: VehicleType[];
  /** Dynamic speed limit enabled */
  dynamicSpeedLimitEnabled: boolean;
  /** Lane closures by segment: segmentId -> array of closed lane indices */
  laneClosures: Map<string, number[]>;
  /** Truck restriction: time window in hours [start, end] */
  truckRestriction: {
    enabled: boolean;
    startHour: number; // 0-24
    endHour: number;   // 0-24
    effect: 'remove' | 'shift' | 'reroute';
  };
}

/**
 * Accident state
 */
export interface Accident {
  id: string;
  segmentId: string;
  position: number; // Distance along segment
  lanesBlocked: number[]; // Array of blocked lane indices
  startTime: number; // Simulation time when accident started
  duration: number; // Duration in seconds (-1 for indefinite)
}

/**
 * Weather conditions affecting simulation
 */
export interface WeatherConditions {
  /** Rain intensity 0-1 */
  rainIntensity: number;
  /** Speed reduction factor due to weather (0-1, 1 = normal) */
  speedFactor: number;
  /** Braking distance increase factor (1 = normal, >1 = worse) */
  brakingFactor: number;
}

/**
 * Scenario configuration
 */
export interface ScenarioConfig {
  type: ScenarioType;
  weather: WeatherConditions;
  accidents: Accident[];
}

/**
 * Default weather conditions by scenario
 */
export const WEATHER_BY_SCENARIO: Record<ScenarioType, WeatherConditions> = {
  normal: {
    rainIntensity: 0,
    speedFactor: 1.0,
    brakingFactor: 1.0,
  },
  accident: {
    rainIntensity: 0,
    speedFactor: 1.0,
    brakingFactor: 1.0,
  },
  rain: {
    rainIntensity: 0.7,
    speedFactor: 0.8,
    brakingFactor: 1.5,
  },
};

/**
 * Demand configuration
 */
export interface DemandConfig {
  /** Total vehicles per hour entering the corridor */
  vehiclesPerHour: number;
  /** Vehicle type composition (must sum to 1) */
  composition: Record<VehicleType, number>;
}

/**
 * Default demand configuration
 */
export const DEFAULT_DEMAND: DemandConfig = {
  vehiclesPerHour: 3000,
  composition: {
    car: 0.70,
    taxi: 0.08,
    bus: 0.02,
    truck: 0.15,
    motorbike: 0.05,
  },
};

/**
 * Simulation configuration
 */
export interface SimulationConfig {
  /** Fixed timestep in seconds */
  dt: number;
  /** Global speed limit in m/s (can be overridden per segment) */
  globalSpeedLimit: number;
  /** RNG seed for deterministic simulation */
  seed: number;
  /** Demand configuration */
  demand: DemandConfig;
  /** Use fixed number of vehicles on the road */
  useFixedVehicleCount: boolean;
  /** Total vehicles on the road */
  totalVehicleCount: number;
  /** Vehicle mix ratios (must sum to 1) */
  vehicleMix: Record<VehicleType, number>;
  /** Target vehicle counts by type */
  vehicleTargets: Record<VehicleType, number>;
  /** Loop vehicles back to start instead of exiting */
  loopVehicles: boolean;
  /** Policy state */
  policies: PolicyState;
  /** Scenario configuration */
  scenario: ScenarioConfig;
  /** Simulation speed multiplier (1 = real-time) */
  speedMultiplier: number;
}

/**
 * Default simulation configuration
 */
export const DEFAULT_CONFIG: SimulationConfig = {
  dt: 0.1, // 100ms timestep
  globalSpeedLimit: 120 / 3.6, // 120 km/h in m/s
  seed: 12345,
  demand: DEFAULT_DEMAND,
  useFixedVehicleCount: true,
  totalVehicleCount: 2000,
  vehicleMix: {
    car: 0.7,
    taxi: 0.075,
    bus: 0.075,
    truck: 0.075,
    motorbike: 0.075,
  },
  vehicleTargets: {
    car: 1400,
    taxi: 150,
    bus: 150,
    truck: 150,
    motorbike: 150,
  },
  loopVehicles: true,
  policies: {
    hovLaneEnabled: false,
    hovAllowedTypes: ['taxi', 'bus'],
    dynamicSpeedLimitEnabled: false,
    laneClosures: new Map(),
    truckRestriction: {
      enabled: false,
      startHour: 7,
      endHour: 10,
      effect: 'remove',
    },
  },
  scenario: {
    type: 'normal',
    weather: WEATHER_BY_SCENARIO.normal,
    accidents: [],
  },
  speedMultiplier: 1,
};

/**
 * Real-time metrics
 */
export interface SimulationMetrics {
  /** Current simulation time in seconds */
  time: number;
  /** Current simulation time as formatted string (HH:MM:SS) */
  timeFormatted: string;
  /** Total vehicles currently in simulation */
  vehicleCount: number;
  /** Vehicles by type */
  vehiclesByType: Record<VehicleType, number>;
  /** Average speed across all vehicles (m/s) */
  averageSpeed: number;
  /** Average speed as km/h */
  averageSpeedKmh: number;
  /** Throughput: vehicles passing checkpoint per hour */
  throughput: number;
  /** Density: vehicles per km per lane */
  density: number;
  /** Congestion level 0-1 */
  congestionLevel: number;
  /** Total vehicles spawned */
  totalVehiclesSpawned: number;
  /** Total vehicles that exited */
  totalVehiclesExited: number;
}

/**
 * Simulation state
 */
export interface SimulationState {
  /** Whether simulation is running */
  running: boolean;
  /** Current simulation time in seconds */
  time: number;
  /** All active vehicles */
  vehicles: Map<string, Vehicle>;
  /** Configuration */
  config: SimulationConfig;
  /** Current metrics */
  metrics: SimulationMetrics;
  /** Metrics history for charting */
  metricsHistory: SimulationMetrics[];
  /** Accumulated time since last vehicle spawn check */
  spawnAccumulator: number;
}

/**
 * Convert total vehicle count + mix into concrete targets
 */
export function computeVehicleTargets(
  total: number,
  mix: Record<VehicleType, number>
): Record<VehicleType, number> {
  const types: VehicleType[] = ['car', 'taxi', 'bus', 'truck', 'motorbike'];
  const normalizedTotal = total > 0 ? total : 0;

  const raw = types.map((type) => ({
    type,
    value: normalizedTotal * (mix[type] || 0),
  }));

  const floors: Record<VehicleType, number> = {
    car: 0, taxi: 0, bus: 0, truck: 0, motorbike: 0,
  };

  let used = 0;
  for (const item of raw) {
    const count = Math.floor(item.value);
    floors[item.type] = count;
    used += count;
  }

  let remaining = normalizedTotal - used;
  raw.sort((a, b) => (b.value - Math.floor(b.value)) - (a.value - Math.floor(a.value)));

  for (let i = 0; i < raw.length && remaining > 0; i++) {
    floors[raw[i].type]++;
    remaining--;
  }

  return floors;
}

/**
 * Create initial simulation state
 */
export function createInitialState(config: Partial<SimulationConfig> = {}): SimulationState {
  const mix = { ...DEFAULT_CONFIG.vehicleMix, ...config.vehicleMix };
  const totalVehicleCount = config.totalVehicleCount ?? DEFAULT_CONFIG.totalVehicleCount;
  const derivedTargets = computeVehicleTargets(totalVehicleCount, mix);
  const fullConfig: SimulationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    demand: { ...DEFAULT_DEMAND, ...config.demand },
    totalVehicleCount,
    vehicleMix: mix,
    vehicleTargets: config.vehicleTargets ?? derivedTargets,
    policies: {
      ...DEFAULT_CONFIG.policies,
      ...config.policies,
      laneClosures: config.policies?.laneClosures ?? new Map(),
    },
    scenario: { ...DEFAULT_CONFIG.scenario, ...config.scenario },
  };

  return {
    running: false,
    time: 0,
    vehicles: new Map(),
    config: fullConfig,
    metrics: createEmptyMetrics(),
    metricsHistory: [],
    spawnAccumulator: 0,
  };
}

/**
 * Create empty metrics object
 */
export function createEmptyMetrics(): SimulationMetrics {
  return {
    time: 0,
    timeFormatted: '00:00:00',
    vehicleCount: 0,
    vehiclesByType: {
      car: 0,
      taxi: 0,
      bus: 0,
      truck: 0,
      motorbike: 0,
    },
    averageSpeed: 0,
    averageSpeedKmh: 0,
    throughput: 0,
    density: 0,
    congestionLevel: 0,
    totalVehiclesSpawned: 0,
    totalVehiclesExited: 0,
  };
}

/**
 * Format simulation time as HH:MM:SS
 */
export function formatSimulationTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
