/**
 * Road network types for the Kifissos corridor
 */

import type { GeoJSONLineString, GeoJSONFeature, GeoJSONFeatureCollection } from './geometry';

export type RoadType = 'motorway' | 'motorway_link' | 'trunk' | 'trunk_link' | 'primary';

export interface RoadProperties {
  id: string;
  name?: string;
  ref?: string; // Road reference (e.g., "A1", "E75")
  roadType: RoadType;
  lanes: number;
  maxSpeed: number; // km/h
  oneway: boolean;
  isRamp: boolean; // On/off ramp
  rampType?: 'on' | 'off';
  length: number; // meters
  direction: 'north' | 'south'; // Kifissia→Faliro is 'south'
}

export type RoadFeature = GeoJSONFeature<GeoJSONLineString, RoadProperties>;
export type RoadFeatureCollection = GeoJSONFeatureCollection<GeoJSONLineString, RoadProperties>;

/**
 * Simplified segment for simulation
 */
export interface RoadSegment {
  id: string;
  coordinates: Array<[number, number]>; // [lon, lat] pairs
  properties: RoadProperties;
  startNodeId: string;
  endNodeId: string;
  connectedSegments: {
    upstream: string[];   // Segments that lead into this one
    downstream: string[]; // Segments this leads to
  };
}

/**
 * Road graph for the corridor
 */
export interface RoadGraph {
  segments: Map<string, RoadSegment>;
  nodes: Map<string, RoadNode>;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
}

export interface RoadNode {
  id: string;
  coordinate: [number, number]; // [lon, lat]
  incomingSegments: string[];
  outgoingSegments: string[];
  type: 'junction' | 'endpoint' | 'ramp_merge' | 'ramp_diverge';
}

/**
 * Map layer configuration
 */
export interface MapLayer {
  id: string;
  type: 'road' | 'ramp' | 'background' | 'label';
  visible: boolean;
  opacity: number;
}
