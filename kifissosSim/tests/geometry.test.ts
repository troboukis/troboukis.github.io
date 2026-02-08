/**
 * Geometry utility tests
 */

import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  polylineLength,
  simplifyLine,
  calculateBounds,
  padBounds,
} from '../src/utils/geometry';

describe('haversineDistance', () => {
  it('should return 0 for same point', () => {
    const point: [number, number] = [23.7, 37.9];
    expect(haversineDistance(point, point)).toBe(0);
  });

  it('should calculate distance between two points in Athens', () => {
    // Syntagma Square to Acropolis (~1km)
    const syntagma: [number, number] = [23.7347, 37.9752];
    const acropolis: [number, number] = [23.7257, 37.9715];

    const distance = haversineDistance(syntagma, acropolis);

    // Should be approximately 900m
    expect(distance).toBeGreaterThan(800);
    expect(distance).toBeLessThan(1000);
  });
});

describe('polylineLength', () => {
  it('should return 0 for single point', () => {
    expect(polylineLength([[23.7, 37.9]])).toBe(0);
  });

  it('should calculate total length of polyline', () => {
    const coords: Array<[number, number]> = [
      [23.7, 37.9],
      [23.71, 37.9],
      [23.71, 37.91],
    ];

    const length = polylineLength(coords);

    // Should be approximately 2km (1km + 1km)
    expect(length).toBeGreaterThan(1800);
    expect(length).toBeLessThan(2200);
  });
});

describe('simplifyLine', () => {
  it('should not modify line with 2 or fewer points', () => {
    const line: Array<[number, number]> = [[23.7, 37.9], [23.8, 38.0]];
    expect(simplifyLine(line)).toEqual(line);
  });

  it('should simplify a straight line to just endpoints', () => {
    // Points along a straight line
    const line: Array<[number, number]> = [
      [23.7, 37.9],
      [23.75, 37.95],
      [23.8, 38.0],
    ];

    const simplified = simplifyLine(line, 0.001);

    expect(simplified.length).toBe(2);
    expect(simplified[0]).toEqual(line[0]);
    expect(simplified[simplified.length - 1]).toEqual(line[line.length - 1]);
  });

  it('should preserve significant bends', () => {
    // Line with a sharp bend
    const line: Array<[number, number]> = [
      [23.7, 37.9],
      [23.75, 37.9],   // Goes east
      [23.75, 38.0],   // Then goes north
    ];

    const simplified = simplifyLine(line, 0.00001);

    // Should keep the corner point
    expect(simplified.length).toBe(3);
  });
});

describe('calculateBounds', () => {
  it('should calculate correct bounding box', () => {
    const coords: Array<[number, number]> = [
      [23.7, 37.9],
      [23.8, 38.0],
      [23.75, 37.95],
    ];

    const bounds = calculateBounds(coords);

    expect(bounds.minLon).toBe(23.7);
    expect(bounds.maxLon).toBe(23.8);
    expect(bounds.minLat).toBe(37.9);
    expect(bounds.maxLat).toBe(38.0);
  });
});

describe('padBounds', () => {
  it('should add padding to bounds', () => {
    const bounds = {
      minLon: 23.7,
      maxLon: 23.8,
      minLat: 37.9,
      maxLat: 38.0,
    };

    const padded = padBounds(bounds, 0.1);

    // 10% padding on each side (use toBeCloseTo for floating point)
    expect(padded.minLon).toBeCloseTo(23.69, 5);
    expect(padded.maxLon).toBeCloseTo(23.81, 5);
    expect(padded.minLat).toBeCloseTo(37.89, 5);
    expect(padded.maxLat).toBeCloseTo(38.01, 5);
  });
});
