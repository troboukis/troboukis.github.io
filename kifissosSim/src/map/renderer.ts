/**
 * Map Renderer for Kifissos Corridor
 *
 * Uses D3.js for SVG rendering of static map layers (roads, labels)
 * and provides hooks for Canvas overlay (vehicles in future milestones).
 */

import * as d3 from 'd3';
import type { RoadFeatureCollection, RoadFeature, RoadType } from '../types';
import { createProjection, calculateMobileZoom, type MapProjection } from './projection';
import { calculateRoadBounds } from './osm-loader';

export interface MapRendererConfig {
  container: HTMLElement;
  data: RoadFeatureCollection;
  onZoom?: (transform: d3.ZoomTransform) => void;
}

export interface MapRenderer {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  projection: MapProjection;
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  currentTransform: d3.ZoomTransform;
  resize: () => void;
  destroy: () => void;
  getTransform: () => d3.ZoomTransform;
}

// NYT-style color palette for road types (muted grays)
const ROAD_COLORS: Record<RoadType, string> = {
  motorway: '#E8E8E8',      // Light gray for main highway
  motorway_link: '#D4D4D4', // Slightly darker for ramps
  trunk: '#E0E0E0',         // Gray for trunk roads
  trunk_link: '#D8D8D8',    // Light gray
  primary: '#ECECEC',       // Very light gray for primary roads
};

// Road outline colors (darker for contrast)
const ROAD_OUTLINE_COLORS: Record<RoadType, string> = {
  motorway: '#B0B0B0',
  motorway_link: '#A0A0A0',
  trunk: '#A8A8A8',
  trunk_link: '#9C9C9C',
  primary: '#B8B8B8',
};

// Default lane counts by road type (fallback when OSM lacks lane info)
const DEFAULT_LANES: Record<RoadType, number> = {
  motorway: 3,
  motorway_link: 1,
  trunk: 2,
  trunk_link: 1,
  primary: 2,
};

// Base lane width (pixels at zoom 1) by road type
const LANE_WIDTHS: Record<RoadType, number> = {
  motorway: 7,
  motorway_link: 5,
  trunk: 6,
  trunk_link: 5,
  primary: 5,
};

function getLaneCount(feature: RoadFeature): number {
  const lanes = feature.properties.lanes || DEFAULT_LANES[feature.properties.roadType];
  return Math.max(1, lanes);
}

function getRoadBaseWidth(feature: RoadFeature): number {
  const laneCount = getLaneCount(feature);
  const laneWidth = LANE_WIDTHS[feature.properties.roadType];
  const shoulder = feature.properties.roadType === 'motorway' ? 6 : 4;
  return laneCount * laneWidth + shoulder;
}

// Widths at different zoom levels
function getRoadWidth(baseWidth: number, zoomScale: number): number {
  return Math.max(2, baseWidth * Math.sqrt(zoomScale));
}

/**
 * Create the map renderer
 */
export function createMapRenderer(config: MapRendererConfig): MapRenderer {
  const { container, data, onZoom } = config;

  // Clear container
  container.innerHTML = '';

  // Get container dimensions
  let width = container.clientWidth;
  let height = container.clientHeight;

  // Calculate bounds from data
  const bounds = calculateRoadBounds(data);

  // Create projection
  let projection = createProjection({ bounds, width, height });

  // Create SVG element
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'map-svg')
    .style('position', 'absolute')
    .style('top', '0')
    .style('left', '0');

  // Create Canvas overlay for future vehicle rendering
  const canvas = document.createElement('canvas');
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none'; // Let SVG handle interactions
  canvas.className = 'vehicle-canvas';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Create layer groups
  const backgroundLayer = svg.append('g').attr('class', 'layer-background');
  const roadLayer = svg.append('g').attr('class', 'layer-roads');
  const labelLayer = svg.append('g').attr('class', 'layer-labels');

  // Create D3 path generator
  const pathGenerator = d3.geoPath()
    .projection(d3.geoMercator()
      .center([(bounds.minLon + bounds.maxLon) / 2, (bounds.minLat + bounds.maxLat) / 2])
      .scale(projection.scale)
      .translate(projection.translate));

  // Draw background
  drawBackground(backgroundLayer, width, height);

  // Draw roads
  drawRoads(roadLayer, data, pathGenerator, projection);

  // Draw labels for major segments
  drawLabels(labelLayer, data, projection);

  // Current transform state
  let currentTransform = d3.zoomIdentity;

  // Create zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .translateExtent([
      [-width * 0.5, -height * 0.5],
      [width * 1.5, height * 1.5],
    ])
    .on('zoom', (event) => {
      currentTransform = event.transform;

      // Apply transform to layers
      roadLayer.attr('transform', currentTransform.toString());
      labelLayer.attr('transform', currentTransform.toString());

      // Scale labels
      labelLayer.selectAll('.road-label')
        .style('font-size', `${Math.max(8, 12 / Math.sqrt(currentTransform.k))}px`);

      // Callback for external handlers
      onZoom?.(currentTransform);
    });

  // Apply zoom to SVG
  svg.call(zoom);

  // Apply initial zoom for mobile
  const initialZoom = calculateMobileZoom(width, height);
  if (initialZoom !== 1) {
    svg.call(zoom.transform, d3.zoomIdentity.scale(initialZoom));
  }

  // Resize handler
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Update projection
    projection = createProjection({ bounds, width, height });

    // Update zoom extent
    zoom.translateExtent([
      [-width * 0.5, -height * 0.5],
      [width * 1.5, height * 1.5],
    ]);

    // Redraw background
    backgroundLayer.selectAll('*').remove();
    drawBackground(backgroundLayer, width, height);
  }

  // Destroy handler
  function destroy() {
    svg.remove();
    canvas.remove();
  }

  return {
    svg,
    canvas,
    ctx,
    projection,
    zoom,
    currentTransform,
    resize,
    destroy,
    getTransform: () => currentTransform,
  };
}

/**
 * Draw background (NYT-style light beige)
 */
function drawBackground(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  height: number
): void {
  // Background rectangle - NYT-style warm light background
  layer.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#F5F1E8'); // Light warm beige
}

/**
 * Draw road segments with lane markings
 */
function drawRoads(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: RoadFeatureCollection,
  pathGenerator: d3.GeoPath,
  projection: MapProjection
): void {
  // Sort roads so major roads render on top
  const sortedFeatures = [...data.features].sort((a, b) => {
    const order: Record<RoadType, number> = {
      primary: 0,
      trunk_link: 1,
      trunk: 2,
      motorway_link: 3,
      motorway: 4,
    };
    return order[a.properties.roadType] - order[b.properties.roadType];
  });

  // Draw road outlines (edge/curb)
  layer.selectAll('.road-outline')
    .data(sortedFeatures)
    .enter()
    .append('path')
    .attr('class', 'road-outline')
    .attr('d', d => pathGenerator(d as unknown as d3.GeoPermissibleObjects))
    .attr('fill', 'none')
    .attr('stroke', d => ROAD_OUTLINE_COLORS[d.properties.roadType])
    .attr('data-base-width', d => String(getRoadBaseWidth(d) + 4))
    .attr('stroke-width', d => getRoadBaseWidth(d) + 4)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');

  // Draw road surface (asphalt gray)
  layer.selectAll('.road')
    .data(sortedFeatures)
    .enter()
    .append('path')
    .attr('class', 'road')
    .attr('data-id', d => d.properties.id)
    .attr('data-type', d => d.properties.roadType)
    .attr('d', d => pathGenerator(d as unknown as d3.GeoPermissibleObjects))
    .attr('fill', 'none')
    .attr('stroke', '#808080') // Asphalt gray
    .attr('data-base-width', d => String(getRoadBaseWidth(d)))
    .attr('stroke-width', d => getRoadBaseWidth(d))
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');

  // Draw lane markings (white dashed lines) for multi-lane roads
  const multiLaneFeatures = sortedFeatures.filter(f => getLaneCount(f) > 1);

  for (const feature of multiLaneFeatures) {
    const laneCount = getLaneCount(feature);
    const roadWidth = getRoadBaseWidth(feature);
    const laneWidth = roadWidth / laneCount;
    const halfWidth = roadWidth / 2;

    const projected = feature.geometry.coordinates.map(c => projection.project(c));
    if (projected.length < 2) continue;

    // Draw white dashed lane dividers as offset polylines
    for (let i = 1; i < laneCount; i++) {
      const offset = -halfWidth + i * laneWidth;
      const offsetCoords = offsetPolyline(projected, offset);
      const d = buildPath(offsetCoords);

      layer.append('path')
        .attr('class', 'lane-marking')
        .attr('d', d)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF')
        .attr('data-base-width', '1')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '10,8')
        .attr('stroke-linecap', 'butt')
        .attr('opacity', 0.7);
    }

    // Edge lines (solid white)
    const edgeLeft = offsetPolyline(projected, -halfWidth + 1);
    const edgeRight = offsetPolyline(projected, halfWidth - 1);

    layer.append('path')
      .attr('class', 'edge-marking')
      .attr('d', buildPath(edgeLeft))
      .attr('fill', 'none')
      .attr('stroke', '#FFFFFF')
      .attr('data-base-width', '1.5')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'butt')
      .attr('opacity', 0.8);

    layer.append('path')
      .attr('class', 'edge-marking')
      .attr('d', buildPath(edgeRight))
      .attr('fill', 'none')
      .attr('stroke', '#FFFFFF')
      .attr('data-base-width', '1.5')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'butt')
      .attr('opacity', 0.8);
  }

}

function buildPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  const [x0, y0] = points[0];
  let d = `M ${x0} ${y0}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    d += ` L ${x} ${y}`;
  }
  return d;
}

function offsetPolyline(
  points: Array<[number, number]>,
  offset: number
): Array<[number, number]> {
  if (points.length < 2) return points;
  const result: Array<[number, number]> = [];

  for (let i = 0; i < points.length; i++) {
    let nx = 0;
    let ny = 0;

    if (i === 0) {
      const [x0, y0] = points[0];
      const [x1, y1] = points[1];
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else if (i === points.length - 1) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else {
      const [xPrev, yPrev] = points[i - 1];
      const [xCurr, yCurr] = points[i];
      const [xNext, yNext] = points[i + 1];

      const dx1 = xCurr - xPrev;
      const dy1 = yCurr - yPrev;
      const len1 = Math.hypot(dx1, dy1) || 1;
      const nx1 = -dy1 / len1;
      const ny1 = dx1 / len1;

      const dx2 = xNext - xCurr;
      const dy2 = yNext - yCurr;
      const len2 = Math.hypot(dx2, dy2) || 1;
      const nx2 = -dy2 / len2;
      const ny2 = dx2 / len2;

      nx = nx1 + nx2;
      ny = ny1 + ny2;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
    }

    const [x, y] = points[i];
    result.push([x + nx * offset, y + ny * offset]);
  }

  return result;
}

/**
 * Draw road labels
 */
function drawLabels(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: RoadFeatureCollection,
  projection: MapProjection
): void {
  // Only label major roads with names or refs
  const labeledRoads = data.features.filter(f =>
    (f.properties.name || f.properties.ref) &&
    f.properties.roadType === 'motorway' &&
    f.properties.length > 500 // Only label longer segments
  );

  // Get unique labels
  const seenLabels = new Set<string>();
  const uniqueLabels: Array<{ feature: RoadFeature; label: string; position: [number, number] }> = [];

  for (const feature of labeledRoads) {
    const label = feature.properties.ref || feature.properties.name || '';
    if (seenLabels.has(label)) continue;
    seenLabels.add(label);

    // Get midpoint of the segment
    const coords = feature.geometry.coordinates;
    const midIndex = Math.floor(coords.length / 2);
    const midpoint = coords[midIndex];
    const position = projection.project(midpoint);

    uniqueLabels.push({ feature, label, position });
  }

  // Draw labels (dark text on light background)
  layer.selectAll('.road-label')
    .data(uniqueLabels)
    .enter()
    .append('text')
    .attr('class', 'road-label')
    .attr('x', d => d.position[0])
    .attr('y', d => d.position[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#333')
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .attr('paint-order', 'stroke')
    .attr('stroke', '#F5F1E8')
    .attr('stroke-width', 3)
    .text(d => d.label);
}

/**
 * Get feature at screen coordinates (for interaction)
 */
export function getFeatureAtPoint(
  renderer: MapRenderer,
  point: [number, number],
  data: RoadFeatureCollection
): RoadFeature | null {
  const transform = renderer.getTransform();
  const threshold = 10 / transform.k; // Adjust hit area based on zoom

  // Inverse transform the point
  const [x, y] = point;
  const transformedX = (x - transform.x) / transform.k;
  const transformedY = (y - transform.y) / transform.k;

  // Check each feature
  for (const feature of data.features) {
    const coords = feature.geometry.coordinates;

    for (let i = 0; i < coords.length - 1; i++) {
      const [px1, py1] = renderer.projection.project(coords[i]);
      const [px2, py2] = renderer.projection.project(coords[i + 1]);

      const dist = pointToLineDistance(
        [transformedX, transformedY],
        [px1, py1],
        [px2, py2]
      );

      if (dist < threshold) {
        return feature;
      }
    }
  }

  return null;
}

/**
 * Calculate distance from point to line segment
 */
function pointToLineDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
}
