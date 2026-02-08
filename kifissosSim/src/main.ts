/**
 * Kifissos Traffic Simulator - Main Entry Point
 *
 * A mobile-first, in-browser traffic simulation for the Kifissos highway
 * corridor in Athens, Greece (Kifissia → Faliro direction).
 */

import * as d3 from 'd3';
import {
  createMapRenderer,
  createVehicleRenderer,
  createStraightHighwayData,
  type MapRenderer,
  type VehicleRenderer,
} from './map';
import { createInfoOverlay, createControlPanel, type InfoOverlay, type ControlPanel } from './ui';
import {
  buildRoadNetwork,
  createSimulationEngine,
  type SimulationEngine,
  type RoadNetwork,
} from './simulation';
import type { RoadFeatureCollection, SimulationConfig } from './types';
import './styles/main.css';

// Application state
interface AppState {
  mapRenderer: MapRenderer | null;
  vehicleRenderer: VehicleRenderer | null;
  infoOverlay: InfoOverlay | null;
  controlPanel: ControlPanel | null;
  simulation: SimulationEngine | null;
  roadData: RoadFeatureCollection | null;
  roadNetwork: RoadNetwork | null;
  animationFrameId: number | null;
}

const state: AppState = {
  mapRenderer: null,
  vehicleRenderer: null,
  infoOverlay: null,
  controlPanel: null,
  simulation: null,
  roadData: null,
  roadNetwork: null,
  animationFrameId: null,
};

const INITIAL_VIEW = {
  center: [23.73, 38.0] as [number, number], // [lon, lat] - straight highway center
  zoom: 7.5,
};

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  const app = document.getElementById('app');
  const loadingScreen = document.getElementById('loading-screen');

  if (!app || !loadingScreen) {
    console.error('Required DOM elements not found');
    return;
  }

  try {
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container';
    app.appendChild(mapContainer);

    // Load synthetic straight highway data
    console.log('Loading synthetic highway...');
    state.roadData = createStraightHighwayData();

    console.log(`Loaded ${state.roadData.features.length} road segments`);

    if (state.roadData.features.length === 0) {
      throw new Error('No road data loaded. Please check your connection.');
    }

    // Build road network for simulation
    state.roadNetwork = buildRoadNetwork(state.roadData);
    console.log(`Built road network with ${state.roadNetwork.segments.size} segments`);
    console.log(`Entry points: ${state.roadNetwork.entryPoints.length}`);
    console.log(`Exit points: ${state.roadNetwork.exitPoints.length}`);
    console.log(`Main corridor segments: ${state.roadNetwork.mainCorridorSegments.length}`);

    // Create map renderer
    state.mapRenderer = createMapRenderer({
      container: mapContainer,
      data: state.roadData,
      onZoom: () => {
        // Render vehicles on zoom change
        renderVehicles();
      },
    });

    // Apply initial close-up view
    applyInitialView();

    // Create vehicle renderer
    state.vehicleRenderer = createVehicleRenderer({
      canvas: state.mapRenderer.canvas,
      ctx: state.mapRenderer.ctx,
      projection: state.mapRenderer.projection,
      network: state.roadNetwork,
    });

    // Create simulation engine
    state.simulation = createSimulationEngine(state.roadNetwork, {
      demand: {
        vehiclesPerHour: 2000,
        composition: { car: 0.70, taxi: 0.08, bus: 0.02, truck: 0.15, motorbike: 0.05 },
      },
      useFixedVehicleCount: true,
      loopVehicles: true,
      totalVehicleCount: 2000,
      vehicleMix: { car: 0.7, taxi: 0.075, bus: 0.075, truck: 0.075, motorbike: 0.075 },
    });

    // Subscribe to simulation updates
    state.simulation.subscribe((simState) => {
      // Update metrics display
      state.controlPanel?.updateMetrics(simState.metrics);
    });

    // Create info overlay with zoom controls
    state.infoOverlay = createInfoOverlay({
      container: app,
      onZoomIn: () => {
        if (state.mapRenderer) {
          state.mapRenderer.svg.transition()
            .duration(300)
            .call(state.mapRenderer.zoom.scaleBy as any, 1.5);
        }
      },
      onZoomOut: () => {
        if (state.mapRenderer) {
          state.mapRenderer.svg.transition()
            .duration(300)
            .call(state.mapRenderer.zoom.scaleBy as any, 0.67);
        }
      },
      onZoomReset: () => {
        if (state.mapRenderer) {
          state.mapRenderer.svg.transition()
            .duration(500)
            .call(state.mapRenderer.zoom.transform as any, d3.zoomIdentity);
        }
      },
    });

    // Create control panel
    state.controlPanel = createControlPanel({
      container: app,
      initialConfig: state.simulation.state.config,
      onConfigChange: (config: Partial<SimulationConfig>) => {
        state.simulation?.updateConfig(config);
      },
      onPlay: () => {
        state.simulation?.start();
      },
      onPause: () => {
        state.simulation?.pause();
      },
      onReset: () => {
        state.simulation?.reset();
        renderVehicles();
      },
    });

    // Update status
    state.infoOverlay.setStatus('ready');
    state.infoOverlay.setRoadCount(state.roadData.features.length);

    // Hide loading screen
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);

    // Handle window resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        state.mapRenderer?.resize();
        renderVehicles();
      }, 100);
    });

    // Start render loop for smooth animation
    startRenderLoop();

    console.log('Application initialized successfully');
    console.log('Click Play to start the simulation!');

  } catch (error) {
    console.error('Failed to initialize:', error);

    // Show error state
    if (state.infoOverlay) {
      state.infoOverlay.setStatus('error', 'Failed to load map');
    } else {
      const loadingText = loadingScreen.querySelector('p');
      if (loadingText) {
        loadingText.textContent = `Error: ${(error as Error).message}`;
        loadingText.style.color = '#e74c3c';
      }
      const loader = loadingScreen.querySelector('.loader') as HTMLElement;
      if (loader) {
        loader.style.borderTopColor = '#e74c3c';
        loader.style.animation = 'none';
      }
    }
  }
}

/**
 * Render vehicles on the canvas
 */
function renderVehicles(): void {
  if (!state.vehicleRenderer || !state.simulation || !state.mapRenderer) return;

  const transform = state.mapRenderer.getTransform();
  state.vehicleRenderer.render(state.simulation.state.vehicles, transform);
}

function applyInitialView(): void {
  if (!state.mapRenderer) return;
  const svgNode = state.mapRenderer.svg.node();
  if (!svgNode) return;

  const { width, height } = svgNode.getBoundingClientRect();
  const [cx, cy] = state.mapRenderer.projection.project(INITIAL_VIEW.center);

  const transform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(INITIAL_VIEW.zoom)
    .translate(-cx, -cy);

  state.mapRenderer.svg.call(state.mapRenderer.zoom.transform as any, transform);
}

/**
 * Start continuous render loop
 */
function startRenderLoop(): void {
  function loop(): void {
    renderVehicles();
    state.animationFrameId = requestAnimationFrame(loop);
  }
  state.animationFrameId = requestAnimationFrame(loop);
}

// Start the application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging in console
(window as any).kifissosSim = {
  getState: () => state,
  clearCache: () => {
    import('./map').then(m => m.clearCache());
  },
  getSimulation: () => state.simulation,
  runSteps: (n: number) => state.simulation?.runSteps(n),
};
