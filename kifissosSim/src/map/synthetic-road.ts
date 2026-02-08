/**
 * Synthetic road generator for a simple straight highway.
 */

import type { RoadFeatureCollection } from '../types';
import { polylineLength } from '../utils/geometry';

export function createStraightHighwayData(): RoadFeatureCollection {
  const coordinates: Array<[number, number]> = [
    [23.73, 38.01], // north
    [23.73, 38.005],
    [23.73, 38.0],
    [23.73, 37.995],
    [23.73, 37.99], // south
  ];

  const length = polylineLength(coordinates);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'synthetic_a1',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          id: 'synthetic_a1',
          name: 'Straight Highway',
          ref: 'A1',
          roadType: 'motorway',
          lanes: 4,
          maxSpeed: 120,
          oneway: true,
          isRamp: false,
          length,
          direction: 'south',
        },
      },
    ],
  };
}
