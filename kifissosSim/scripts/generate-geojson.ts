/**
 * Offline GeoJSON Generation Script
 *
 * Fetches Kifissos corridor data from Overpass API and saves as static GeoJSON.
 * Run with: npm run generate-geojson
 *
 * This creates a fallback data file for when the Overpass API is unavailable.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Kifissos highway corridor bounding box
const KIFISSOS_BBOX = {
  south: 37.88,
  west: 23.66,
  north: 38.08,
  east: 23.76,
};

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

interface OSMWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags: Record<string, string>;
}

interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
}

interface OverpassResponse {
  elements: Array<OSMWay | OSMNode>;
}

function buildOverpassQuery(): string {
  const { south, west, north, east } = KIFISSOS_BBOX;
  const bbox = `${south},${west},${north},${east}`;

  return `
    [out:json][timeout:120];
    (
      way["highway"="motorway"]["ref"~"A1|A6|Α1|Α6|Ε75|E75"](${bbox});
      way["highway"="motorway"]["name"~"Κηφισ|Kifis|ΚΗΦΙΣ"](${bbox});
      way["highway"="motorway_link"](${bbox});
      way["highway"="motorway"](${bbox});
      way["highway"="trunk"]["ref"~"A1|A6|Ε75|E75"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `.trim();
}

async function fetchFromOverpass(): Promise<OverpassResponse> {
  console.log('Fetching from Overpass API...');
  const query = buildOverpassQuery();

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function simplifyLine(
  points: Array<[number, number]>,
  tolerance: number = 0.00003
): Array<[number, number]> {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyLine(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyLine(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.sqrt((x - (x1 + t * dx)) ** 2 + (y - (y1 + t * dy)) ** 2);
}

function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000;
  const lat1 = coord1[1] * Math.PI / 180;
  const lat2 = coord2[1] * Math.PI / 180;
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function polylineLength(coords: Array<[number, number]>): number {
  let length = 0;
  for (let i = 1; i < coords.length; i++) {
    length += haversineDistance(coords[i - 1], coords[i]);
  }
  return length;
}

type RoadType = 'motorway' | 'motorway_link' | 'trunk' | 'trunk_link' | 'primary';

function getRoadType(tags: Record<string, string>): RoadType {
  const highway = tags.highway;
  if (highway === 'motorway') return 'motorway';
  if (highway === 'motorway_link') return 'motorway_link';
  if (highway === 'trunk') return 'trunk';
  if (highway === 'trunk_link') return 'trunk_link';
  if (highway === 'primary') return 'primary';
  return 'motorway';
}

function parseLanes(tags: Record<string, string>): number {
  if (tags.lanes) {
    const lanes = parseInt(tags.lanes, 10);
    if (!isNaN(lanes) && lanes > 0) return lanes;
  }
  if (tags.highway === 'motorway') return 4;
  if (tags.highway === 'motorway_link') return 1;
  if (tags.highway === 'trunk') return 3;
  return 2;
}

function parseMaxSpeed(tags: Record<string, string>): number {
  if (tags.maxspeed) {
    const speed = parseInt(tags.maxspeed, 10);
    if (!isNaN(speed)) return speed;
  }
  if (tags.highway === 'motorway') return 120;
  if (tags.highway === 'motorway_link') return 60;
  if (tags.highway === 'trunk') return 100;
  return 90;
}

function determineDirection(coords: Array<[number, number]>): 'north' | 'south' {
  if (coords.length < 2) return 'south';
  return coords[coords.length - 1][1] < coords[0][1] ? 'south' : 'north';
}

function convertToGeoJSON(response: OverpassResponse) {
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

  const features = [];

  for (const way of ways) {
    const coordinates: Array<[number, number]> = [];

    for (const nodeId of way.nodes) {
      const coord = nodes.get(nodeId);
      if (coord) coordinates.push(coord);
    }

    if (coordinates.length < 2) continue;

    const simplified = simplifyLine(coordinates);
    const roadType = getRoadType(way.tags);
    const direction = determineDirection(simplified);
    const isRamp = way.tags.highway === 'motorway_link' || way.tags.highway === 'trunk_link';

    features.push({
      type: 'Feature',
      id: way.id,
      geometry: {
        type: 'LineString',
        coordinates: simplified,
      },
      properties: {
        id: `way_${way.id}`,
        name: way.tags.name,
        ref: way.tags.ref,
        roadType,
        lanes: parseLanes(way.tags),
        maxSpeed: parseMaxSpeed(way.tags),
        oneway: way.tags.oneway === 'yes' || roadType === 'motorway' || roadType === 'motorway_link',
        isRamp,
        rampType: isRamp ? (way.tags.name?.toLowerCase().includes('exit') ? 'off' : 'on') : undefined,
        length: polylineLength(simplified),
        direction,
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

async function main() {
  try {
    const data = await fetchFromOverpass();
    const geoJSON = convertToGeoJSON(data);

    console.log(`Generated ${geoJSON.features.length} features`);

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    const publicDataDir = join(process.cwd(), 'public', 'data');

    try { mkdirSync(dataDir, { recursive: true }); } catch {}
    try { mkdirSync(publicDataDir, { recursive: true }); } catch {}

    // Write to both locations
    const outputPath = join(dataDir, 'kifissos-corridor.json');
    const publicOutputPath = join(publicDataDir, 'kifissos-corridor.json');

    writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2));
    writeFileSync(publicOutputPath, JSON.stringify(geoJSON, null, 2));

    console.log(`Saved to ${outputPath}`);
    console.log(`Saved to ${publicOutputPath}`);

    // Print statistics
    const stats = {
      totalFeatures: geoJSON.features.length,
      motorways: geoJSON.features.filter(f => f.properties.roadType === 'motorway').length,
      ramps: geoJSON.features.filter(f => f.properties.isRamp).length,
      totalLength: geoJSON.features.reduce((sum, f) => sum + f.properties.length, 0),
    };

    console.log('\nStatistics:');
    console.log(`  Total features: ${stats.totalFeatures}`);
    console.log(`  Motorway segments: ${stats.motorways}`);
    console.log(`  Ramp segments: ${stats.ramps}`);
    console.log(`  Total length: ${(stats.totalLength / 1000).toFixed(1)} km`);

  } catch (error) {
    console.error('Failed to generate GeoJSON:', error);
    process.exit(1);
  }
}

main();
