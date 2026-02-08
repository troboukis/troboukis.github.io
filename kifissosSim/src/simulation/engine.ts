/**
 * Simulation Engine
 *
 * Main simulation loop that coordinates vehicle movement, lane changes,
 * and demand generation with deterministic fixed-timestep updates.
 */

import type {
  Vehicle,
  VehicleType,
  SimulationState,
  SimulationConfig,
  SimulationMetrics,
  Accident,
} from '../types';
import { getVehicleParams, createVehicle } from '../types/vehicle';
import { createInitialState, formatSimulationTime, createEmptyMetrics, computeVehicleTargets } from '../types/simulation';
import type { RoadNetwork, SimSegment } from './road-model';
import { getEffectiveSpeedLimit, getAvailableLanes } from './road-model';
import { createRNG, type RandomGenerator } from './random';
import {
  calculateIDMAcceleration,
  updateVehicleKinematics,
  findLeader,
} from './car-following';
import {
  determineLaneChangeDirection,
  isMandatoryLaneChange,
  executeLaneChange,
} from './lane-changing';
import {
  calculateSpawnCount,
  spawnVehicles,
  getDemandMultiplier,
} from './demand-generator';

/**
 * Simulation engine instance
 */
export interface SimulationEngine {
  /** Current state */
  state: SimulationState;
  /** Road network */
  network: RoadNetwork;
  /** Random number generator */
  rng: RandomGenerator;
  /** Step the simulation by one timestep */
  step: () => void;
  /** Run multiple steps */
  runSteps: (count: number) => void;
  /** Start continuous simulation */
  start: () => void;
  /** Pause simulation */
  pause: () => void;
  /** Reset simulation */
  reset: (config?: Partial<SimulationConfig>) => void;
  /** Add accident */
  addAccident: (accident: Omit<Accident, 'id' | 'startTime'>) => void;
  /** Remove accident */
  removeAccident: (id: string) => void;
  /** Update configuration */
  updateConfig: (config: Partial<SimulationConfig>) => void;
  /** Get metrics */
  getMetrics: () => SimulationMetrics;
  /** Subscribe to updates */
  subscribe: (callback: (state: SimulationState) => void) => () => void;
}

/**
 * Create simulation engine
 */
export function createSimulationEngine(
  network: RoadNetwork,
  config: Partial<SimulationConfig> = {}
): SimulationEngine {
  let state = createInitialState(config);
  let rng = createRNG(state.config.seed);
  let animationFrameId: number | null = null;
  let lastTickTime = 0;
  const subscribers: Set<(state: SimulationState) => void> = new Set();

  // Seed initial vehicles for immediate visibility
  seedVehiclesToTargets();
  updateMetrics();

  // Counter for metrics history sampling
  let metricsCounter = 0;
  const METRICS_SAMPLE_INTERVAL = 10; // Sample every 10 steps (1 second at dt=0.1)

  // Accumulated time for step timing
  let timeAccumulator = 0;

  /**
   * Notify subscribers of state change
   */
  function notifySubscribers(): void {
    for (const callback of subscribers) {
      callback(state);
    }
  }

  function seedVehiclesToTargets(): void {
    if (!state.config.useFixedVehicleCount) return;
    state.vehicles.clear();

    const mainSegmentId = network.mainCorridorSegments[0] || network.entryPoints[0];
    const segment = mainSegmentId ? network.segments.get(mainSegmentId) : null;
    if (!segment) return;

    const targets = state.config.vehicleTargets;
    const totalTarget = Object.values(targets).reduce((sum, v) => sum + v, 0);
    if (totalTarget === 0) return;

    const corridorLength = segment.length || 1;
    const spacing = Math.max(6, corridorLength / totalTarget);

    const typeBag: VehicleType[] = [];
    (Object.keys(targets) as VehicleType[]).forEach((type) => {
      const count = targets[type];
      for (let i = 0; i < count; i++) {
        typeBag.push(type);
      }
    });

    // Shuffle for mixed distribution
    for (let i = typeBag.length - 1; i > 0; i--) {
      const j = Math.floor(rng.randFloat(0, 1) * (i + 1));
      const tmp = typeBag[i];
      typeBag[i] = typeBag[j];
      typeBag[j] = tmp;
    }

    for (let index = 0; index < typeBag.length; index++) {
      const type = typeBag[index];
      const corridorPos = Math.min(corridorLength - 1, (index + 0.5) * spacing);
      const lane = index % Math.max(1, segment.laneCount);

      const vehicle = createVehicle(
        {
          type,
          segmentId: segment.id,
          lane,
          position: corridorPos,
        },
        segment.speedLimit,
        state.time
      );

      state.vehicles.set(vehicle.id, vehicle);
      state.metrics.totalVehiclesSpawned++;
    }
  }

  function reconcileTargetCounts(): void {
    if (!state.config.useFixedVehicleCount) return;

    const targets = state.config.vehicleTargets;
    const currentCounts: Record<VehicleType, number> = {
      car: 0, taxi: 0, bus: 0, truck: 0, motorbike: 0,
    };

    for (const v of state.vehicles.values()) {
      currentCounts[v.type]++;
    }

    const mainSegmentId = network.mainCorridorSegments[0] || network.entryPoints[0];
    const segment = mainSegmentId ? network.segments.get(mainSegmentId) : null;
    if (!segment) return;

    const corridorLength = segment.length || 1;
    const totalTarget = Object.values(targets).reduce((sum, v) => sum + v, 0);
    if (totalTarget === 0) {
      state.vehicles.clear();
      return;
    }
    const spacing = Math.max(6, corridorLength / Math.max(1, totalTarget));

    // Add missing vehicles in mixed order
    const missingBag: VehicleType[] = [];
    (Object.keys(targets) as VehicleType[]).forEach((type) => {
      const missing = targets[type] - currentCounts[type];
      for (let i = 0; i < missing; i++) {
        missingBag.push(type);
      }
    });

    for (let i = missingBag.length - 1; i > 0; i--) {
      const j = Math.floor(rng.randFloat(0, 1) * (i + 1));
      const tmp = missingBag[i];
      missingBag[i] = missingBag[j];
      missingBag[j] = tmp;
    }

    let index = state.vehicles.size;
    for (const type of missingBag) {
      const corridorPos = Math.min(corridorLength - 1, (index + 0.5) * spacing);
      const lane = index % Math.max(1, segment.laneCount);
      const vehicle = createVehicle(
        {
          type,
          segmentId: segment.id,
          lane,
          position: corridorPos,
        },
        segment.speedLimit,
        state.time
      );
      state.vehicles.set(vehicle.id, vehicle);
      state.metrics.totalVehiclesSpawned++;
      index++;
    }

    // Remove extra vehicles
    if (state.vehicles.size > totalTarget) {
      for (const [id, vehicle] of state.vehicles) {
        if (currentCounts[vehicle.type] > targets[vehicle.type]) {
          state.vehicles.delete(id);
          currentCounts[vehicle.type]--;
          if (state.vehicles.size <= totalTarget) break;
        }
      }
    }
  }

  /**
   * Step simulation by one timestep
   */
  function step(): void {
    const { config, vehicles } = state;
    const dt = config.dt;

    // 1. Spawn/reconcile vehicles
    if (!config.useFixedVehicleCount) {
      const { count, newAccumulator } = calculateSpawnCount(
        {
          ...config.demand,
          vehiclesPerHour: config.demand.vehiclesPerHour * getDemandMultiplier(state.time),
        },
        dt,
        state.spawnAccumulator
      );

      state.spawnAccumulator = newAccumulator;

      if (count > 0) {
        const vehicleArray = Array.from(vehicles.values());
        const { vehicles: newVehicles } = spawnVehicles(
          network,
          config.demand,
          config.policies,
          vehicleArray,
          state.time,
          count,
          rng
        );

        for (const v of newVehicles) {
          vehicles.set(v.id, v);
          state.metrics.totalVehiclesSpawned++;
        }
      }
    } else {
      reconcileTargetCounts();
    }

    // 2. Update each vehicle
    const vehiclesToRemove: string[] = [];
    const vehicleArray = Array.from(vehicles.values());

    for (const vehicle of vehicleArray) {
      const segment = network.segments.get(vehicle.segmentId);
      if (!segment) {
        vehiclesToRemove.push(vehicle.id);
        continue;
      }

      // Get effective speed limit
      const weatherFactor = config.scenario.weather.speedFactor;
      const brakingFactor = config.scenario.weather.brakingFactor;
      const speedLimit = getEffectiveSpeedLimit(segment, weatherFactor);

      // Update desired speed
      const params = getVehicleParams(vehicle);
      vehicle.desiredSpeed = Math.min(speedLimit * params.desiredSpeedFactor, params.maxSpeed);

      // Get vehicles in same segment and lane
      const vehiclesInLane = vehicleArray.filter(
        v => v.segmentId === vehicle.segmentId && v.lane === vehicle.lane
      );

      // Find leader
      const leader = findLeader(vehicle, vehiclesInLane);

      // Check for accidents blocking the lane
      const accidentBlocking = isLaneBlockedByAccident(
        vehicle,
        segment,
        config.scenario.accidents
      );

      // Calculate acceleration
      let acceleration: number;

      if (accidentBlocking) {
        // Treat accident as stopped obstacle
        acceleration = calculateIDMAcceleration(
          vehicle,
          {
            gap: Math.max(0, accidentBlocking.distance - params.length),
            speed: 0,
            length: 10,
          },
          speedLimit,
          brakingFactor
        );
      } else {
        acceleration = calculateIDMAcceleration(vehicle, leader, speedLimit, brakingFactor);
      }

      // Update kinematics
      const { newSpeed, newPosition, distanceTraveled } = updateVehicleKinematics(
        vehicle,
        acceleration,
        dt
      );

      vehicle.speed = newSpeed;
      vehicle.position = newPosition;
      vehicle.acceleration = acceleration;
      vehicle.distanceTraveled += distanceTraveled;
      vehicle.timeInSimulation += dt;

      // 3. Lane changing
      const closedLanes = config.policies.laneClosures.get(segment.id) || [];
      const availableLanes = getAvailableLanes(
        segment,
        params.canUseHOV,
        config.policies.hovLaneEnabled,
        closedLanes
      );

      // Check mandatory lane change
      const mandatory = isMandatoryLaneChange(
        vehicle,
        segment,
        closedLanes,
        vehicle.isExiting
      );

      if (mandatory.mandatory) {
        const targetLane = mandatory.targetDirection === 'left'
          ? vehicle.lane + 1
          : vehicle.lane - 1;

        if (availableLanes.includes(targetLane)) {
          // Simplified: execute immediately if target is available
          executeLaneChange(vehicle, targetLane);
        }
      } else {
        // Discretionary lane change
        const decision = determineLaneChangeDirection(
          vehicle,
          segment,
          vehicleArray,
          speedLimit,
          availableLanes,
          brakingFactor,
          rng
        );

        if (decision.shouldChange) {
          executeLaneChange(vehicle, decision.targetLane);
        }
      }

      // 4. Check segment transition
      if (vehicle.position >= segment.length) {
        const overflow = vehicle.position - segment.length;

        if (config.loopVehicles) {
          vehicle.position = overflow;
        } else if (segment.downstream.length === 0 || segment.isExit) {
          // Vehicle exits the corridor
          vehiclesToRemove.push(vehicle.id);
          state.metrics.totalVehiclesExited++;
        } else {
          // Move to next segment
          const nextSegmentId = selectNextSegment(segment, vehicle, rng);
          const nextSegment = network.segments.get(nextSegmentId);

          if (nextSegment) {
            vehicle.segmentId = nextSegmentId;
            vehicle.position = overflow;

            // Adjust lane if necessary
            if (vehicle.lane >= nextSegment.laneCount) {
              vehicle.lane = nextSegment.laneCount - 1;
            }
          } else {
            vehiclesToRemove.push(vehicle.id);
            state.metrics.totalVehiclesExited++;
          }
        }
      }
    }

    // Remove exited vehicles
    for (const id of vehiclesToRemove) {
      vehicles.delete(id);
    }

    // 5. Update simulation time
    state.time += dt;

    // 6. Update metrics
    updateMetrics();

    // Sample metrics for history
    metricsCounter++;
    if (metricsCounter >= METRICS_SAMPLE_INTERVAL) {
      metricsCounter = 0;
      state.metricsHistory.push({ ...state.metrics });

      // Keep history bounded
      if (state.metricsHistory.length > 1000) {
        state.metricsHistory = state.metricsHistory.slice(-500);
      }
    }
  }

  /**
   * Check if lane is blocked by accident ahead
   */
  function isLaneBlockedByAccident(
    vehicle: Vehicle,
    segment: SimSegment,
    accidents: Accident[]
  ): { distance: number } | null {
    for (const accident of accidents) {
      if (accident.segmentId === segment.id && accident.lanesBlocked.includes(vehicle.lane)) {
        const distance = accident.position - vehicle.position;
        if (distance > 0 && distance < 200) {
          // Accident is ahead within 200m
          return { distance };
        }
      }
    }
    return null;
  }

  /**
   * Select next segment when transitioning
   */
  function selectNextSegment(
    currentSegment: SimSegment,
    vehicle: Vehicle,
    rng: RandomGenerator
  ): string {
    if (currentSegment.downstream.length === 1) {
      return currentSegment.downstream[0];
    }

    // If multiple downstream, prefer main corridor unless vehicle is exiting
    const mainSegments = currentSegment.downstream.filter(id => {
      const seg = network.segments.get(id);
      return seg && !seg.isRamp;
    });

    if (vehicle.isExiting) {
      // Prefer ramps for exiting vehicles
      const ramps = currentSegment.downstream.filter(id => {
        const seg = network.segments.get(id);
        return seg && seg.isRamp && seg.rampType === 'off';
      });
      if (ramps.length > 0) {
        return rng.pick(ramps);
      }
    }

    if (mainSegments.length > 0) {
      return rng.pick(mainSegments);
    }

    return rng.pick(currentSegment.downstream);
  }

  /**
   * Update metrics
   */
  function updateMetrics(): void {
    const { vehicles } = state;
    const vehicleArray = Array.from(vehicles.values());

    // Count by type
    const byType: Record<VehicleType, number> = {
      car: 0, taxi: 0, bus: 0, truck: 0, motorbike: 0,
    };

    let totalSpeed = 0;

    for (const v of vehicleArray) {
      byType[v.type]++;
      totalSpeed += v.speed;
    }

    const avgSpeed = vehicleArray.length > 0 ? totalSpeed / vehicleArray.length : 0;

    // Calculate density (vehicles per km)
    const corridorLengthKm = network.totalLength / 1000;
    const density = corridorLengthKm > 0 ? vehicleArray.length / corridorLengthKm : 0;

    // Calculate throughput (vehicles per hour based on recent exits)
    const throughput = (state.metrics.totalVehiclesExited / Math.max(state.time, 1)) * 3600;

    // Congestion level (0-1) based on speed vs free flow
    const freeFlowSpeed = state.config.globalSpeedLimit;
    const congestionLevel = freeFlowSpeed > 0 ? 1 - (avgSpeed / freeFlowSpeed) : 0;

    state.metrics = {
      time: state.time,
      timeFormatted: formatSimulationTime(state.time),
      vehicleCount: vehicleArray.length,
      vehiclesByType: byType,
      averageSpeed: avgSpeed,
      averageSpeedKmh: avgSpeed * 3.6,
      throughput,
      density,
      congestionLevel: Math.max(0, Math.min(1, congestionLevel)),
      totalVehiclesSpawned: state.metrics.totalVehiclesSpawned,
      totalVehiclesExited: state.metrics.totalVehiclesExited,
    };
  }

  /**
   * Animation loop for continuous simulation
   */
  function animationLoop(timestamp: number): void {
    if (!state.running) return;

    // Calculate elapsed real time
    if (lastTickTime === 0) {
      lastTickTime = timestamp;
    }

    const elapsed = (timestamp - lastTickTime) / 1000; // Convert to seconds
    lastTickTime = timestamp;

    // Accumulate time scaled by speed multiplier
    timeAccumulator += elapsed * state.config.speedMultiplier;

    // Run simulation steps for accumulated time
    const dt = state.config.dt;
    let stepsRun = 0;
    const maxSteps = 20; // Cap steps per frame to prevent freezing

    while (timeAccumulator >= dt && stepsRun < maxSteps) {
      step();
      timeAccumulator -= dt;
      stepsRun++;
    }

    // Prevent accumulator from growing too large if simulation can't keep up
    if (timeAccumulator > dt * 10) {
      timeAccumulator = dt * 2;
    }

    notifySubscribers();

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  /**
   * Start continuous simulation
   */
  function start(): void {
    if (state.running) return;
    state.running = true;
    lastTickTime = 0;
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  /**
   * Pause simulation
   */
  function pause(): void {
    state.running = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Reset simulation
   */
  function reset(newConfig: Partial<SimulationConfig> = {}): void {
    pause();
    state = createInitialState({ ...state.config, ...newConfig });
    rng = createRNG(state.config.seed);
    metricsCounter = 0;
    timeAccumulator = 0;
    seedVehiclesToTargets();
    updateMetrics();
    notifySubscribers();
  }

  /**
   * Add accident
   */
  function addAccident(accident: Omit<Accident, 'id' | 'startTime'>): void {
    const newAccident: Accident = {
      ...accident,
      id: `accident_${Date.now()}`,
      startTime: state.time,
    };
    state.config.scenario.accidents.push(newAccident);
  }

  /**
   * Remove accident
   */
  function removeAccident(id: string): void {
    state.config.scenario.accidents = state.config.scenario.accidents.filter(
      a => a.id !== id
    );
  }

  /**
   * Update configuration
   */
  function updateConfig(newConfig: Partial<SimulationConfig>): void {
    state.config = {
      ...state.config,
      ...newConfig,
      demand: { ...state.config.demand, ...newConfig.demand },
      vehicleMix: { ...state.config.vehicleMix, ...newConfig.vehicleMix },
      vehicleTargets: { ...state.config.vehicleTargets, ...newConfig.vehicleTargets },
      policies: {
        ...state.config.policies,
        ...newConfig.policies,
        laneClosures: newConfig.policies?.laneClosures ?? state.config.policies.laneClosures,
      },
      scenario: { ...state.config.scenario, ...newConfig.scenario },
    };

    if (newConfig.totalVehicleCount !== undefined || newConfig.vehicleMix) {
      state.config.vehicleTargets = computeVehicleTargets(
        state.config.totalVehicleCount,
        state.config.vehicleMix
      );
    }

    if (newConfig.vehicleTargets || newConfig.useFixedVehicleCount || newConfig.totalVehicleCount !== undefined || newConfig.vehicleMix) {
      seedVehiclesToTargets();
      updateMetrics();
    }
  }

  /**
   * Subscribe to updates
   */
  function subscribe(callback: (state: SimulationState) => void): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  return {
    get state() { return state; },
    get network() { return network; },
    get rng() { return rng; },
    step,
    runSteps: (count: number) => {
      for (let i = 0; i < count; i++) step();
      notifySubscribers();
    },
    start,
    pause,
    reset,
    addAccident,
    removeAccident,
    updateConfig,
    getMetrics: () => state.metrics,
    subscribe,
  };
}
