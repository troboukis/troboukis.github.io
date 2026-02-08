/**
 * Control Panel UI Component
 *
 * Mobile-first control panel for simulation parameters.
 * Includes sliders, toggles, and scenario selection.
 */

import type { SimulationConfig, SimulationMetrics, ScenarioType, VehicleType } from '../types';

export interface ControlPanelConfig {
  container: HTMLElement;
  initialConfig: SimulationConfig;
  onConfigChange: (config: Partial<SimulationConfig>) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

export interface ControlPanel {
  element: HTMLElement;
  updateMetrics: (metrics: SimulationMetrics) => void;
  setPlaying: (playing: boolean) => void;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  destroy: () => void;
}

export function createControlPanel(config: ControlPanelConfig): ControlPanel {
  const { container, initialConfig, onConfigChange, onPlay, onPause, onReset } = config;

  // Create panel element
  const element = document.createElement('div');
  element.className = 'control-panel visible';
  element.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">
        <span class="panel-icon">🚗</span>
        <span>Simulation Controls</span>
      </div>
      <button class="panel-toggle" aria-label="Toggle panel">▼</button>
    </div>

    <div class="panel-content">
      <!-- Playback Controls -->
      <div class="control-section playback-controls">
        <button class="btn btn-play" aria-label="Play">▶</button>
        <button class="btn btn-pause" aria-label="Pause" style="display:none">⏸</button>
        <button class="btn btn-reset" aria-label="Reset">↺</button>
        <div class="speed-control">
          <label>Speed:</label>
          <select class="speed-select">
            <option value="0.5">0.5×</option>
            <option value="1" selected>1×</option>
            <option value="2">2×</option>
            <option value="5">5×</option>
            <option value="10">10×</option>
          </select>
        </div>
      </div>

      <!-- Metrics Display -->
      <div class="control-section metrics-display">
        <div class="metric">
          <span class="metric-label">Time</span>
          <span class="metric-value" data-metric="time">00:00:00</span>
        </div>
        <div class="metric">
          <span class="metric-label">Vehicles</span>
          <span class="metric-value" data-metric="vehicles">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Speed</span>
          <span class="metric-value" data-metric="speed">0 km/h</span>
        </div>
        <div class="metric">
          <span class="metric-label">Congestion</span>
          <span class="metric-value congestion-bar" data-metric="congestion">
            <span class="bar-fill" style="width: 0%"></span>
          </span>
        </div>
      </div>

      <!-- Scenario Selection -->
      <div class="control-section">
        <label class="section-label">Scenario</label>
        <div class="scenario-buttons">
          <button class="scenario-btn active" data-scenario="normal">Normal</button>
          <button class="scenario-btn" data-scenario="rain">Rain</button>
          <button class="scenario-btn" data-scenario="accident">Accident</button>
        </div>
      </div>

      <!-- Speed Limit Control -->
      <div class="control-section">
        <label class="section-label">
          Speed Limit
          <span class="value-display" data-value="speedLimit">${Math.round(initialConfig.globalSpeedLimit * 3.6)} km/h</span>
        </label>
        <input type="range" class="slider" data-control="speedLimit"
          min="60" max="140" step="10" value="${Math.round(initialConfig.globalSpeedLimit * 3.6)}">
      </div>

      <!-- Vehicle Total -->
      <div class="control-section">
        <label class="section-label">
          Total Vehicles
          <span class="value-display" data-value="totalCount">${initialConfig.totalVehicleCount}</span>
        </label>
        <input type="range" class="slider" data-control="totalVehicles"
          min="0" max="4000" step="50" value="${initialConfig.totalVehicleCount}">
        <div class="vehicle-counts">
          <div class="count-item">
            <span class="legend-chip"><span class="chip-color" style="background:#1a73e8"></span>Car</span>
            <span class="count-value" data-count-value="car">0</span>
          </div>
          <div class="count-item">
            <span class="legend-chip"><span class="chip-color" style="background:#fbbc04"></span>Taxi</span>
            <span class="count-value" data-count-value="taxi">0</span>
          </div>
          <div class="count-item">
            <span class="legend-chip"><span class="chip-color" style="background:#34a853"></span>Bus</span>
            <span class="count-value" data-count-value="bus">0</span>
          </div>
          <div class="count-item">
            <span class="legend-chip"><span class="chip-color" style="background:#ea4335"></span>Truck</span>
            <span class="count-value" data-count-value="truck">0</span>
          </div>
          <div class="count-item">
            <span class="legend-chip"><span class="chip-color" style="background:#9334e6"></span>Motorbike</span>
            <span class="count-value" data-count-value="motorbike">0</span>
          </div>
        </div>
      </div>

      <!-- Policy Toggles -->
      <div class="control-section">
        <label class="section-label">Policies</label>
        <div class="toggle-group">
          <label class="toggle">
            <input type="checkbox" data-policy="hov" ${initialConfig.policies.hovLaneEnabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">HOV Lane</span>
          </label>
          <label class="toggle">
            <input type="checkbox" data-policy="truckBan" ${initialConfig.policies.truckRestriction.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Truck Ban (7-10am)</span>
          </label>
        </div>
      </div>
    </div>
  `;

  container.appendChild(element);

  // Get element references
  const panelContent = element.querySelector('.panel-content') as HTMLElement;
  const panelToggle = element.querySelector('.panel-toggle') as HTMLButtonElement;
  const playBtn = element.querySelector('.btn-play') as HTMLButtonElement;
  const pauseBtn = element.querySelector('.btn-pause') as HTMLButtonElement;
  const resetBtn = element.querySelector('.btn-reset') as HTMLButtonElement;
  const speedSelect = element.querySelector('.speed-select') as HTMLSelectElement;
  const speedLimitSlider = element.querySelector('[data-control="speedLimit"]') as HTMLInputElement;
  const totalVehiclesSlider = element.querySelector('[data-control="totalVehicles"]') as HTMLInputElement;
  const scenarioBtns = element.querySelectorAll('.scenario-btn');
  const hovToggle = element.querySelector('[data-policy="hov"]') as HTMLInputElement;
  const truckBanToggle = element.querySelector('[data-policy="truckBan"]') as HTMLInputElement;

  let isExpanded = true;
  let isPlaying = false;

  // Panel toggle
  panelToggle.addEventListener('click', () => {
    isExpanded = !isExpanded;
    panelContent.style.display = isExpanded ? 'block' : 'none';
    panelToggle.textContent = isExpanded ? '▼' : '▲';
  });

  // Playback controls
  playBtn.addEventListener('click', () => {
    onPlay();
    setPlaying(true);
  });

  pauseBtn.addEventListener('click', () => {
    onPause();
    setPlaying(false);
  });

  resetBtn.addEventListener('click', () => {
    onReset();
    setPlaying(false);
  });

  // Speed multiplier
  speedSelect.addEventListener('change', () => {
    onConfigChange({ speedMultiplier: parseFloat(speedSelect.value) });
  });

  // Speed limit slider
  speedLimitSlider.addEventListener('input', () => {
    const valueKmh = parseInt(speedLimitSlider.value);
    element.querySelector('[data-value="speedLimit"]')!.textContent = `${valueKmh} km/h`;
    onConfigChange({ globalSpeedLimit: valueKmh / 3.6 });
  });

  function computeTargets(total: number): Record<VehicleType, number> {
    const car = Math.round(total * 0.7);
    const remaining = Math.max(0, total - car);
    const perOther = Math.floor(remaining / 4);
    let extra = remaining - perOther * 4;

    const targets: Record<VehicleType, number> = {
      car,
      taxi: perOther,
      bus: perOther,
      truck: perOther,
      motorbike: perOther,
    };

    const order: VehicleType[] = ['taxi', 'bus', 'truck', 'motorbike'];
    for (let i = 0; i < order.length && extra > 0; i++) {
      targets[order[i]]++;
      extra--;
    }

    return targets;
  }

  function renderTargets(targets: Record<VehicleType, number>): void {
    (Object.keys(targets) as VehicleType[]).forEach((type) => {
      element.querySelector(`[data-count-value="${type}"]`)!.textContent = String(targets[type]);
    });
  }

  function updateTotalCountDisplay(total: number): void {
    element.querySelector('[data-value="totalCount"]')!.textContent = String(total);
  }

  totalVehiclesSlider.addEventListener('input', () => {
    const total = parseInt(totalVehiclesSlider.value, 10);
    updateTotalCountDisplay(total);
    const targets = computeTargets(total);
    renderTargets(targets);
    onConfigChange({
      useFixedVehicleCount: true,
      totalVehicleCount: total,
      vehicleMix: {
        car: 0.7,
        taxi: 0.075,
        bus: 0.075,
        truck: 0.075,
        motorbike: 0.075,
      },
      vehicleTargets: targets,
    });
  });

  const initialTargets = computeTargets(initialConfig.totalVehicleCount);
  renderTargets(initialTargets);

  // Scenario buttons
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scenario = btn.getAttribute('data-scenario') as ScenarioType;
      const weather = scenario === 'rain'
        ? { rainIntensity: 0.7, speedFactor: 0.8, brakingFactor: 1.5 }
        : { rainIntensity: 0, speedFactor: 1.0, brakingFactor: 1.0 };

      onConfigChange({
        scenario: {
          type: scenario,
          weather,
          accidents: scenario === 'accident' ? [{
            id: 'default_accident',
            segmentId: Array.from(document.querySelectorAll('[data-id]'))[0]?.getAttribute('data-id') || 'seg1',
            position: 2000,
            lanesBlocked: [1, 2],
            startTime: 0,
            duration: -1,
          }] : [],
        }
      });
    });
  });

  // Policy toggles
  hovToggle.addEventListener('change', () => {
    onConfigChange({
      policies: {
        ...initialConfig.policies,
        hovLaneEnabled: hovToggle.checked,
      }
    });
  });

  truckBanToggle.addEventListener('change', () => {
    onConfigChange({
      policies: {
        ...initialConfig.policies,
        truckRestriction: {
          ...initialConfig.policies.truckRestriction,
          enabled: truckBanToggle.checked,
        }
      }
    });
  });

  function setPlaying(playing: boolean): void {
    isPlaying = playing;
    playBtn.style.display = playing ? 'none' : 'inline-flex';
    pauseBtn.style.display = playing ? 'inline-flex' : 'none';
  }

  function updateMetrics(metrics: SimulationMetrics): void {
    element.querySelector('[data-metric="time"]')!.textContent = metrics.timeFormatted;
    element.querySelector('[data-metric="vehicles"]')!.textContent = String(metrics.vehicleCount);
    element.querySelector('[data-metric="speed"]')!.textContent = `${Math.round(metrics.averageSpeedKmh)} km/h`;

    const congestionFill = element.querySelector('.bar-fill') as HTMLElement;
    const congestionPercent = Math.round(metrics.congestionLevel * 100);
    congestionFill.style.width = `${congestionPercent}%`;

    // Color based on congestion
    if (congestionPercent < 30) {
      congestionFill.style.background = '#27AE60';
    } else if (congestionPercent < 60) {
      congestionFill.style.background = '#F1C40F';
    } else {
      congestionFill.style.background = '#E74C3C';
    }
  }

  function show(): void {
    element.classList.add('visible');
  }

  function hide(): void {
    element.classList.remove('visible');
  }

  function toggle(): void {
    element.classList.toggle('visible');
  }

  function destroy(): void {
    element.remove();
  }

  return {
    element,
    updateMetrics,
    setPlaying,
    show,
    hide,
    toggle,
    destroy,
  };
}
