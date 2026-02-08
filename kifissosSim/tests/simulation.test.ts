/**
 * Simulation Engine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRNG,
  calculateIDMAcceleration,
  calculateSafeDistance,
  updateVehicleKinematics,
  findLeader,
  calculateSpawnCount,
  selectVehicleType,
  getDemandMultiplier,
  buildRoadNetwork,
} from '../src/simulation';
import {
  createVehicle,
  resetVehicleIdCounter,
  VEHICLE_PARAMS,
  type Vehicle,
  type VehicleType,
} from '../src/types/vehicle';
import type { RoadFeatureCollection } from '../src/types';

// Helper to create test vehicle
function createTestVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'test_v1',
    type: 'car',
    segmentId: 'seg1',
    position: 0,
    lane: 0,
    speed: 30, // m/s (108 km/h)
    acceleration: 0,
    desiredSpeed: 33.3, // 120 km/h in m/s
    timeInSimulation: 0,
    distanceTraveled: 0,
    targetLane: -1,
    isExiting: false,
    entryTime: 0,
    ...overrides,
  };
}

describe('Random Number Generator', () => {
  it('should produce deterministic sequence with same seed', () => {
    const rng1 = createRNG(12345);
    const rng2 = createRNG(12345);

    const seq1 = [rng1.random(), rng1.random(), rng1.random()];
    const seq2 = [rng2.random(), rng2.random(), rng2.random()];

    expect(seq1).toEqual(seq2);
  });

  it('should produce different sequences with different seeds', () => {
    const rng1 = createRNG(12345);
    const rng2 = createRNG(54321);

    expect(rng1.random()).not.toBe(rng2.random());
  });

  it('randInt should produce values in range', () => {
    const rng = createRNG(42);

    for (let i = 0; i < 100; i++) {
      const val = rng.randInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('randFloat should produce values in range', () => {
    const rng = createRNG(42);

    for (let i = 0; i < 100; i++) {
      const val = rng.randFloat(0.5, 1.5);
      expect(val).toBeGreaterThanOrEqual(0.5);
      expect(val).toBeLessThan(1.5);
    }
  });

  it('pick should select from array', () => {
    const rng = createRNG(42);
    const arr = ['a', 'b', 'c', 'd'];

    for (let i = 0; i < 20; i++) {
      const val = rng.pick(arr);
      expect(arr).toContain(val);
    }
  });

  it('pickWeighted should respect weights', () => {
    const rng = createRNG(42);
    const items = ['rare', 'common'];
    const weights = [0.1, 0.9];

    let rareCount = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      if (rng.pickWeighted(items, weights) === 'rare') {
        rareCount++;
      }
    }

    // Expect roughly 10% rare (with some tolerance)
    expect(rareCount).toBeGreaterThan(50);
    expect(rareCount).toBeLessThan(200);
  });
});

describe('IDM Car-Following Model', () => {
  it('should accelerate on free road', () => {
    const vehicle = createTestVehicle({ speed: 20 });
    const speedLimit = 33.3; // 120 km/h

    const accel = calculateIDMAcceleration(vehicle, null, speedLimit);

    expect(accel).toBeGreaterThan(0);
  });

  it('should decelerate when approaching slower leader', () => {
    const vehicle = createTestVehicle({ speed: 30 });
    const leader = { gap: 20, speed: 15, length: 4.5 };
    const speedLimit = 33.3;

    const accel = calculateIDMAcceleration(vehicle, leader, speedLimit);

    expect(accel).toBeLessThan(0);
  });

  it('should maintain speed when following at safe distance', () => {
    const vehicle = createTestVehicle({ speed: 25 });
    const leader = { gap: 50, speed: 25, length: 4.5 };
    const speedLimit = 33.3;

    const accel = calculateIDMAcceleration(vehicle, leader, speedLimit);

    // Should be close to zero (small adjustment)
    expect(Math.abs(accel)).toBeLessThan(1);
  });

  it('should apply stronger deceleration in bad weather', () => {
    // Use a moderate scenario where deceleration won't be clamped
    const vehicle = createTestVehicle({ speed: 25 });
    const leader = { gap: 40, speed: 22, length: 4.5 };
    const speedLimit = 33.3;

    const accelNormal = calculateIDMAcceleration(vehicle, leader, speedLimit, 1.0);
    const accelRain = calculateIDMAcceleration(vehicle, leader, speedLimit, 1.5);

    // Rain should cause stronger deceleration (more negative or less positive)
    // Note: both may be negative, so "less than" means more deceleration
    expect(accelRain).toBeLessThanOrEqual(accelNormal);
  });
});

describe('Safe Distance Calculation', () => {
  it('should increase with speed', () => {
    const params = VEHICLE_PARAMS.car;

    const dist20 = calculateSafeDistance(20, 20, params.minGap, params.reactionTime, params.comfortDeceleration);
    const dist30 = calculateSafeDistance(30, 30, params.minGap, params.reactionTime, params.comfortDeceleration);

    expect(dist30).toBeGreaterThan(dist20);
  });

  it('should increase in bad weather', () => {
    const params = VEHICLE_PARAMS.car;

    const distNormal = calculateSafeDistance(25, 25, params.minGap, params.reactionTime, params.comfortDeceleration, 1.0);
    const distRain = calculateSafeDistance(25, 25, params.minGap, params.reactionTime, params.comfortDeceleration, 1.5);

    expect(distRain).toBeGreaterThan(distNormal);
  });
});

describe('Vehicle Kinematics', () => {
  it('should update position based on speed', () => {
    const vehicle = createTestVehicle({ speed: 20, position: 100 });
    const dt = 0.1;

    const { newPosition, distanceTraveled } = updateVehicleKinematics(vehicle, 0, dt);

    expect(newPosition).toBeCloseTo(102, 1); // 100 + 20 * 0.1
    expect(distanceTraveled).toBeCloseTo(2, 1);
  });

  it('should update speed based on acceleration', () => {
    const vehicle = createTestVehicle({ speed: 20 });
    const dt = 0.1;

    const { newSpeed } = updateVehicleKinematics(vehicle, 2.0, dt);

    expect(newSpeed).toBeCloseTo(20.2, 2); // 20 + 2 * 0.1
  });

  it('should not go below zero speed', () => {
    const vehicle = createTestVehicle({ speed: 1 });
    const dt = 0.1;

    const { newSpeed } = updateVehicleKinematics(vehicle, -20, dt);

    expect(newSpeed).toBe(0);
  });

  it('should not exceed max speed', () => {
    const vehicle = createTestVehicle({ speed: 49 }); // Just below max (50 m/s)
    const dt = 0.1;

    const { newSpeed } = updateVehicleKinematics(vehicle, 100, dt);

    expect(newSpeed).toBeLessThanOrEqual(VEHICLE_PARAMS.car.maxSpeed);
  });
});

describe('Find Leader', () => {
  it('should find closest vehicle ahead', () => {
    const vehicle = createTestVehicle({ position: 100 });
    const vehiclesInLane: Vehicle[] = [
      createTestVehicle({ id: 'v1', position: 50, speed: 20 }),  // Behind
      createTestVehicle({ id: 'v2', position: 150, speed: 25 }), // Ahead (closest)
      createTestVehicle({ id: 'v3', position: 200, speed: 30 }), // Ahead (farther)
    ];

    const leader = findLeader(vehicle, vehiclesInLane);

    expect(leader).not.toBeNull();
    expect(leader!.speed).toBe(25);
  });

  it('should return null when no vehicle ahead', () => {
    const vehicle = createTestVehicle({ position: 100 });
    const vehiclesInLane: Vehicle[] = [
      createTestVehicle({ id: 'v1', position: 50, speed: 20 }),
      createTestVehicle({ id: 'v2', position: 30, speed: 25 }),
    ];

    const leader = findLeader(vehicle, vehiclesInLane);

    expect(leader).toBeNull();
  });
});

describe('Demand Generation', () => {
  it('should calculate correct spawn count', () => {
    const config = { vehiclesPerHour: 3600, composition: { car: 1, taxi: 0, bus: 0, truck: 0, motorbike: 0 } };
    const dt = 0.1;

    // 3600 veh/hr = 1 veh/sec = 0.1 veh per 0.1s
    const result = calculateSpawnCount(config, dt, 0);

    expect(result.count).toBe(0);
    expect(result.newAccumulator).toBeCloseTo(0.1, 5);

    // After 11 steps (slightly over 1 second), should spawn 1 vehicle
    // Use 11 to avoid floating point precision issues with exactly 10 * 0.1
    let acc = 0;
    let totalSpawned = 0;
    for (let i = 0; i < 11; i++) {
      const r = calculateSpawnCount(config, dt, acc);
      totalSpawned += r.count;
      acc = r.newAccumulator;
    }

    expect(totalSpawned).toBe(1);
  });

  it('should select vehicle type based on composition', () => {
    const rng = createRNG(42);
    const composition: Record<VehicleType, number> = {
      car: 0.7,
      taxi: 0.1,
      bus: 0.05,
      truck: 0.1,
      motorbike: 0.05,
    };

    const counts: Record<VehicleType, number> = { car: 0, taxi: 0, bus: 0, truck: 0, motorbike: 0 };
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      const type = selectVehicleType(composition, rng);
      counts[type]++;
    }

    // Cars should be most common (~70%)
    expect(counts.car).toBeGreaterThan(600);
    expect(counts.car).toBeLessThan(800);

    // Trucks should be ~10%
    expect(counts.truck).toBeGreaterThan(50);
    expect(counts.truck).toBeLessThan(200);
  });

  it('should vary demand by time of day', () => {
    // Morning peak (7-9)
    const morningPeak = getDemandMultiplier(1 * 3600); // 1 hour into sim (07:00)

    // Off-peak night (22:00)
    const nightOffPeak = getDemandMultiplier(16 * 3600); // 16 hours into sim (22:00)

    // Normal daytime
    const daytime = getDemandMultiplier(6 * 3600); // 6 hours into sim (12:00)

    expect(morningPeak).toBeGreaterThan(daytime);
    expect(nightOffPeak).toBeLessThan(daytime);
  });
});

describe('Road Network Building', () => {
  const testGeoJSON: RoadFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 1,
        geometry: {
          type: 'LineString',
          coordinates: [
            [23.7, 38.0],
            [23.7, 37.95],
          ],
        },
        properties: {
          id: 'seg1',
          name: 'Test Segment 1',
          roadType: 'motorway',
          lanes: 4,
          maxSpeed: 120,
          oneway: true,
          isRamp: false,
          length: 5000,
          direction: 'south',
        },
      },
      {
        type: 'Feature',
        id: 2,
        geometry: {
          type: 'LineString',
          coordinates: [
            [23.7, 37.95],
            [23.7, 37.9],
          ],
        },
        properties: {
          id: 'seg2',
          name: 'Test Segment 2',
          roadType: 'motorway',
          lanes: 4,
          maxSpeed: 120,
          oneway: true,
          isRamp: false,
          length: 5500,
          direction: 'south',
        },
      },
    ],
  };

  it('should build network from GeoJSON', () => {
    const network = buildRoadNetwork(testGeoJSON);

    expect(network.segments.size).toBe(2);
    expect(network.totalLength).toBeGreaterThan(0);
  });

  it('should identify entry and exit points', () => {
    const network = buildRoadNetwork(testGeoJSON);

    expect(network.entryPoints.length).toBeGreaterThan(0);
    expect(network.exitPoints.length).toBeGreaterThan(0);
  });

  it('should connect adjacent segments', () => {
    const network = buildRoadNetwork(testGeoJSON);

    const seg1 = network.segments.get('seg1');
    const seg2 = network.segments.get('seg2');

    expect(seg1).toBeDefined();
    expect(seg2).toBeDefined();

    // seg1 should have seg2 as downstream
    expect(seg1!.downstream).toContain('seg2');

    // seg2 should have seg1 as upstream
    expect(seg2!.upstream).toContain('seg1');
  });
});

describe('Vehicle Creation', () => {
  beforeEach(() => {
    resetVehicleIdCounter();
  });

  it('should create vehicle with correct initial state', () => {
    const vehicle = createVehicle(
      { type: 'car', segmentId: 'seg1', lane: 1 },
      33.3, // 120 km/h speed limit
      0
    );

    expect(vehicle.type).toBe('car');
    expect(vehicle.segmentId).toBe('seg1');
    expect(vehicle.lane).toBe(1);
    expect(vehicle.speed).toBeGreaterThan(0);
    expect(vehicle.desiredSpeed).toBeLessThanOrEqual(33.3);
  });

  it('should generate unique IDs', () => {
    const v1 = createVehicle({ type: 'car', segmentId: 'seg1', lane: 0 }, 33.3, 0);
    const v2 = createVehicle({ type: 'taxi', segmentId: 'seg1', lane: 1 }, 33.3, 0);

    expect(v1.id).not.toBe(v2.id);
  });

  it('should respect vehicle type parameters', () => {
    const truck = createVehicle({ type: 'truck', segmentId: 'seg1', lane: 0 }, 33.3, 0);
    const motorbike = createVehicle({ type: 'motorbike', segmentId: 'seg1', lane: 0 }, 33.3, 0);

    // Truck should have lower desired speed than motorbike
    expect(truck.desiredSpeed).toBeLessThan(motorbike.desiredSpeed);
  });
});
