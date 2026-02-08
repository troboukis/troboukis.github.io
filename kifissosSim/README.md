# Kifissos Traffic Simulator

An interactive, mobile-first web simulation of traffic on the Kifissos highway corridor in Athens, Greece. Built to help the general public understand factors that influence traffic and simulate the impact of government policies.

## Overview

This simulation models the **Kifissia → Faliro** direction of the A1/A6 motorway (Kifissos Avenue), including:
- Main highway segments
- On/off ramps
- Multiple vehicle types (cars, taxis, buses, trucks, motorbikes)
- Traffic policies (HOV lanes, speed limits, lane closures)
- Incident scenarios (accidents, weather conditions)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 on your device
```

## Architecture

### Directory Structure

```
src/
├── types/           # TypeScript type definitions
│   ├── geometry.ts  # GeoJSON and coordinate types
│   ├── road.ts      # Road network types
│   └── index.ts
├── map/             # Map loading and rendering
│   ├── osm-loader.ts    # Overpass API + caching
│   ├── projection.ts    # Mercator projection for Athens
│   ├── renderer.ts      # D3/SVG + Canvas rendering
│   └── index.ts
├── simulation/      # Traffic simulation engine (Milestone 2)
├── ui/              # UI components
│   ├── info-overlay.ts  # Status, zoom controls, legend
│   └── index.ts
├── utils/           # Utility functions
│   ├── geometry.ts      # Distance, simplification algorithms
│   └── index.ts
├── styles/          # CSS styles
│   └── main.css
└── main.ts          # Application entry point

scripts/
└── generate-geojson.ts  # Offline data generation

data/                # Static data files
public/data/         # Public static data (served by Vite)

tests/               # Unit tests (Milestone 2)
```

### Key Design Decisions

#### 1. OSM Data Extraction

The Kifissos corridor is defined by:
- **Bounding box**: 37.88°N - 38.08°N, 23.66°E - 23.76°E
- **Overpass query** filters for:
  - `highway=motorway` with refs A1, A6, E75
  - `highway=motorway_link` (on/off ramps)
  - Roads with "Κηφισ" or "Kifis" in the name

Data pipeline:
1. Check localStorage cache (7-day TTL)
2. If cache miss, fetch from Overpass API
3. If API fails, load bundled `/data/kifissos-corridor.json`

To generate fallback data:
```bash
npm run generate-geojson
```

#### 2. Map Projection

Uses **Mercator projection** (via `d3.geoMercator()`) centered on Athens:
- Center: ~37.98°N, 23.71°E
- Scale calculated dynamically to fit viewport
- Projection handles coordinate transformation: `[lon, lat]` → `[x, y]`

This is the standard for web maps and provides accurate local representation.

#### 3. Road Graph Data Structure

```typescript
interface RoadSegment {
  id: string;
  coordinates: [lon, lat][];
  properties: {
    roadType: 'motorway' | 'motorway_link' | ...;
    lanes: number;        // Default 4 for motorway
    maxSpeed: number;     // km/h (120 for motorway)
    isRamp: boolean;
    direction: 'north' | 'south';
    length: number;       // meters
  };
  connectedSegments: {
    upstream: string[];
    downstream: string[];
  };
}
```

Vehicles traverse segments by:
1. Following polyline coordinates
2. Tracking position as distance along segment
3. Transitioning to connected downstream segments

#### 4. SVG vs Canvas Rendering

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Background | SVG | Simple, one-time render |
| Roads | SVG (D3) | Interactive (hover, click), stable geometry |
| Labels | SVG | Text rendering, scales with zoom |
| Vehicles | Canvas | Thousands of moving objects, 60fps target |

SVG is used for static/interactive elements; Canvas for high-performance vehicle animation.

#### 5. Lane-Change & Car-Following (Milestone 2)

**Car-following**: Simplified IDM (Intelligent Driver Model)
- Maintains safe following distance
- Acceleration/deceleration based on gap to leader
- Speed capped at segment limit and vehicle desired speed

**Lane-changing**: Probabilistic with safety check
- Checks gap in target lane
- Probability based on speed difference and desire to overtake
- Mandatory changes near ramps

## Development

### Scripts

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run generate-geojson  # Generate static fallback data
```

### Testing on Mobile

The dev server binds to `0.0.0.0`, so you can access it from your phone:

1. Find your local IP: `ifconfig | grep inet`
2. Open `http://<your-ip>:3000` on your phone
3. Use Chrome DevTools mobile emulation for quick testing

### Performance Tips

- Geometry is simplified using Douglas-Peucker (~3m tolerance)
- Road segments are cached in localStorage
- Vehicle rendering uses Canvas with requestAnimationFrame
- Touch events use `passive: true` for smooth scrolling

## Milestones

### Milestone 1 - Map ✅
- [x] Vite + TypeScript scaffold
- [x] OSM data pipeline (Overpass API + cache + fallback)
- [x] D3 map rendering with Mercator projection
- [x] Zoom/pan with touch support
- [x] Mobile-first responsive design
- [x] Road styling by type (motorway, ramps, trunk)

### Milestone 2 - Simulation Core (Next)
- [ ] Road graph model with lanes
- [ ] Vehicle agents with IDM car-following
- [ ] Probabilistic lane changing
- [ ] Demand injection by vehicle type
- [ ] Unit tests for simulation

### Milestone 3 - Rendering + UI
- [ ] Canvas vehicle rendering
- [ ] Control panel (sliders, toggles)
- [ ] Real-time metrics (avg speed, throughput)
- [ ] Scenario selector

### Milestone 4 - Incidents + Policies
- [ ] Accident placement
- [ ] Rain scenario
- [ ] HOV lane
- [ ] Dynamic speed limits
- [ ] Truck restrictions

### Milestone 5 - Polish
- [ ] Game-like aesthetics
- [ ] Onboarding tooltips
- [ ] Preset scenarios
- [ ] Performance optimization

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Mobile Chrome/Safari

## License

MIT

## Credits

- Road data: OpenStreetMap contributors
- Visualization: D3.js
- Build tool: Vite
