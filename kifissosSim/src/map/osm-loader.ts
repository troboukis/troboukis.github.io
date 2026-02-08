/**
 * OSM Data Loader for Kifissos Corridor
 *
 * Fetches road data from Overpass API and caches in localStorage.
 * Falls back to bundled GeoJSON if API fails.
 */

import type { RoadFeature, RoadFeatureCollection, RoadType, RoadProperties } from '../types';
import { simplifyLine, polylineLength, calculateBounds, mergeBounds, padBounds } from '../utils/geometry';

// Kifissos highway corridor bounding box (Kifissia to Faliro)
// This encompasses the main A1/A6 highway segment
const KIFISSOS_BBOX = {
  south: 37.88,   // Faliro area
  west: 23.66,
  north: 38.08,   // Kifissia area
  east: 23.76,
};

const CACHE_KEY = 'kifissos_osm_data';
const CACHE_VERSION = 'v1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Overpass API endpoints (use multiple for fallback)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

/**
 * OSM way element from Overpass API
 */
interface OSMWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags: Record<string, string>;
}

/**
 * OSM node element from Overpass API
 */
interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
}

interface OverpassResponse {
  elements: Array<OSMWay | OSMNode>;
}

interface CacheEntry {
  version: string;
  timestamp: number;
  data: RoadFeatureCollection;
}

/**
 * Build Overpass QL query for Kifissos corridor
 * Fetches motorways, motorway_link (ramps), and major roads in the area
 */
function buildOverpassQuery(): string {
  const { south, west, north, east } = KIFISSOS_BBOX;
  const bbox = `${south},${west},${north},${east}`;

  return `
    [out:json][timeout:60];
    (
      // Main motorway (Kifissos - A1 only)
      way["highway"="motorway"]["ref"~"A1|Α1"](${bbox});
      way["highway"="motorway"]["name"~"Κηφισ|Kifis|ΚΗΦΙΣ"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `.trim();
}

/**
 * Fetch data from Overpass API with retry logic
 */
async function fetchFromOverpass(): Promise<OverpassResponse> {
  const query = buildOverpassQuery();
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`Fetching from ${endpoint}...`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.elements?.length || 0} elements from Overpass`);
      return data;
    } catch (error) {
      console.warn(`Overpass endpoint ${endpoint} failed:`, error);
      lastError = error as Error;
    }
  }

  throw new Error(`All Overpass endpoints failed. Last error: ${lastError?.message}`);
}

/**
 * Determine road type from OSM tags
 */
function getRoadType(tags: Record<string, string>): RoadType {
  const highway = tags.highway;

  if (highway === 'motorway') return 'motorway';
  if (highway === 'motorway_link') return 'motorway_link';
  if (highway === 'trunk') return 'trunk';
  if (highway === 'trunk_link') return 'trunk_link';
  if (highway === 'primary') return 'primary';

  return 'motorway'; // Default for this corridor
}

/**
 * Determine if a way is an on/off ramp
 */
function isRamp(tags: Record<string, string>): boolean {
  return tags.highway === 'motorway_link' || tags.highway === 'trunk_link';
}

/**
 * Parse lanes from OSM tags
 */
function parseLanes(tags: Record<string, string>): number {
  if (tags.lanes) {
    const lanes = parseInt(tags.lanes, 10);
    if (!isNaN(lanes) && lanes > 0) return lanes;
  }

  // Default lanes based on road type
  if (tags.highway === 'motorway') return 4;
  if (tags.highway === 'motorway_link') return 1;
  if (tags.highway === 'trunk') return 3;

  return 2;
}

/**
 * Parse max speed from OSM tags
 */
function parseMaxSpeed(tags: Record<string, string>): number {
  if (tags.maxspeed) {
    const speed = parseInt(tags.maxspeed, 10);
    if (!isNaN(speed)) return speed;
  }

  // Default speeds for Greek motorways
  if (tags.highway === 'motorway') return 120;
  if (tags.highway === 'motorway_link') return 60;
  if (tags.highway === 'trunk') return 100;

  return 90;
}

/**
 * Determine direction based on coordinate trend
 * Returns 'south' for Kifissia→Faliro direction
 */
function determineDirection(coordinates: Array<[number, number]>): 'north' | 'south' {
  if (coordinates.length < 2) return 'south';

  const startLat = coordinates[0][1];
  const endLat = coordinates[coordinates.length - 1][1];

  // If ending latitude is lower, we're going south (Kifissia→Faliro)
  return endLat < startLat ? 'south' : 'north';
}

/**
 * Convert Overpass response to GeoJSON FeatureCollection
 */
function convertToGeoJSON(response: OverpassResponse, simplify: boolean = true): RoadFeatureCollection {
  // Build node lookup map
  const nodes = new Map<number, [number, number]>();
  const ways: OSMWay[] = [];

  for (const element of response.elements) {
    if (element.type === 'node') {
      nodes.set(element.id, [element.lon, element.lat]);
    } else if (element.type === 'way') {
      ways.push(element);
    }
  }

  console.log(`Processing ${ways.length} ways with ${nodes.size} nodes`);

  const features: RoadFeature[] = [];

  for (const way of ways) {
    // Skip ways without valid coordinates
    const coordinates: Array<[number, number]> = [];

    for (const nodeId of way.nodes) {
      const coord = nodes.get(nodeId);
      if (coord) {
        coordinates.push(coord);
      }
    }

    if (coordinates.length < 2) continue;

    // Simplify geometry for performance
    const simplifiedCoords = simplify
      ? simplifyLine(coordinates, 0.000005) // ~0.5m tolerance for better shape
      : coordinates;

    const roadType = getRoadType(way.tags);
    const direction = determineDirection(simplifiedCoords);

    // For v1, we only want the southbound direction (Kifissia→Faliro)
    // Keep all roads for now; filtering can be done in simulation

    const properties: RoadProperties = {
      id: `way_${way.id}`,
      name: way.tags.name,
      ref: way.tags.ref,
      roadType,
      lanes: parseLanes(way.tags),
      maxSpeed: parseMaxSpeed(way.tags),
      oneway: way.tags.oneway === 'yes' || roadType === 'motorway' || roadType === 'motorway_link',
      isRamp: isRamp(way.tags),
      rampType: isRamp(way.tags) ? (way.tags.name?.toLowerCase().includes('exit') ? 'off' : 'on') : undefined,
      length: polylineLength(simplifiedCoords),
      direction,
    };

    features.push({
      type: 'Feature',
      id: way.id,
      geometry: {
        type: 'LineString',
        coordinates: simplifiedCoords,
      },
      properties,
    });
  }

  console.log(`Created ${features.length} road features`);

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Get cached data if valid
 */
function getCachedData(): RoadFeatureCollection | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      console.log('Cache version mismatch, invalidating');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check age
    if (Date.now() - entry.timestamp > CACHE_MAX_AGE_MS) {
      console.log('Cache expired, invalidating');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log('Using cached OSM data');
    return entry.data;
  } catch (error) {
    console.warn('Failed to read cache:', error);
    return null;
  }
}

/**
 * Save data to cache
 */
function cacheData(data: RoadFeatureCollection): void {
  try {
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    console.log('Cached OSM data');
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

/**
 * Load fallback GeoJSON from bundled data
 */
async function loadFallbackData(): Promise<RoadFeatureCollection> {
  try {
    const response = await fetch('/data/kifissos-corridor.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load fallback data:', error);
  }

  // Return minimal empty collection as last resort
  console.error('No road data available');
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

/**
 * Main loader function
 * Attempts: cache → Overpass API → fallback JSON
 */
export async function loadKifissosData(): Promise<RoadFeatureCollection> {
  // Try cache first
  const cached = getCachedData();
  if (cached && cached.features.length > 0) {
    return cached;
  }

  // Try Overpass API
  try {
    const osmData = await fetchFromOverpass();
    const geoJSON = convertToGeoJSON(osmData);

    if (geoJSON.features.length > 0) {
      cacheData(geoJSON);
      return geoJSON;
    }
  } catch (error) {
    console.error('Overpass API failed:', error);
  }

  // Fall back to bundled data
  console.log('Falling back to bundled GeoJSON');
  return loadFallbackData();
}

/**
 * Calculate bounds from road data
 */
export function calculateRoadBounds(data: RoadFeatureCollection): ReturnType<typeof padBounds> {
  const allCoords: Array<[number, number]> = [];

  for (const feature of data.features) {
    allCoords.push(...feature.geometry.coordinates);
  }

  const bounds = calculateBounds(allCoords);
  return padBounds(bounds, 0.05);
}

/**
 * Filter features to only include relevant corridor segments
 */
export function filterKifissosCorridor(data: RoadFeatureCollection): RoadFeatureCollection {
  // Keep only A1 motorways, and normalize southbound direction
  const corridorFeatures = data.features.filter(feature => {
    const { roadType, ref, name } = feature.properties;
    const refValue = ref || '';
    const nameValue = name || '';

    // Only keep A1-related motorways
    if (roadType !== 'motorway') return false;

    const hasA1Ref = /A1|Α1/.test(refValue);
    const hasKifissosName = /κηφισ|kifis/i.test(nameValue);
    const isA1 = hasA1Ref || hasKifissosName;

    return isA1;
  });

  return {
    type: 'FeatureCollection',
    features: corridorFeatures.map(feature => {
      if (feature.properties.direction === 'north') {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [...feature.geometry.coordinates].reverse(),
          },
          properties: {
            ...feature.properties,
            direction: 'south',
          },
        };
      }
      return feature;
    }),
  };
}

/**
 * Clear cached data (useful for development)
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('Cache cleared');
}
