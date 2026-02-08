/**
 * Info Overlay UI Component
 *
 * Displays status badge, zoom controls, and legend
 */

import type { RoadFeatureCollection } from '../types';

export interface InfoOverlayConfig {
  container: HTMLElement;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export interface InfoOverlay {
  element: HTMLElement;
  setStatus: (status: 'loading' | 'ready' | 'error', message?: string) => void;
  setRoadCount: (count: number) => void;
  destroy: () => void;
}

export function createInfoOverlay(config: InfoOverlayConfig): InfoOverlay {
  const { container, onZoomIn, onZoomOut, onZoomReset } = config;

  // Create overlay container
  const element = document.createElement('div');
  element.className = 'info-overlay';
  element.innerHTML = `
    <div class="status-badge">
      <span class="dot loading"></span>
      <span class="status-text">Loading...</span>
    </div>
    <div class="zoom-controls">
      <button class="zoom-btn zoom-in" aria-label="Zoom in">+</button>
      <button class="zoom-btn zoom-out" aria-label="Zoom out">−</button>
      <button class="zoom-btn zoom-reset" aria-label="Reset zoom">⟲</button>
    </div>
  `;

  container.appendChild(element);

  // Add legend with vehicle types
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = `
    <div class="legend-title" style="font-weight: 600; margin-bottom: 6px; font-size: 10px; text-transform: uppercase; color: #666;">Vehicles</div>
    <div class="legend-item">
      <span class="legend-color" style="background: #1a73e8; width: 10px; height: 10px; border-radius: 2px;"></span>
      <span>Cars</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background: #fbbc04; width: 10px; height: 10px; border-radius: 2px;"></span>
      <span>Taxis</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background: #34a853; width: 12px; height: 12px; border-radius: 2px;"></span>
      <span>Buses</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background: #ea4335; width: 12px; height: 14px; border-radius: 2px;"></span>
      <span>Trucks</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background: #9334e6; width: 6px; height: 8px; border-radius: 2px;"></span>
      <span>Motorbikes</span>
    </div>
  `;
  container.appendChild(legend);

  // Get references
  const statusDot = element.querySelector('.dot') as HTMLElement;
  const statusText = element.querySelector('.status-text') as HTMLElement;
  const zoomInBtn = element.querySelector('.zoom-in') as HTMLButtonElement;
  const zoomOutBtn = element.querySelector('.zoom-out') as HTMLButtonElement;
  const zoomResetBtn = element.querySelector('.zoom-reset') as HTMLButtonElement;

  // Add event listeners
  zoomInBtn.addEventListener('click', onZoomIn);
  zoomOutBtn.addEventListener('click', onZoomOut);
  zoomResetBtn.addEventListener('click', onZoomReset);

  // Touch event handling for better mobile response
  const addTouchFeedback = (btn: HTMLButtonElement) => {
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'scale(0.95)';
    }, { passive: true });
    btn.addEventListener('touchend', () => {
      btn.style.transform = '';
    }, { passive: true });
  };

  addTouchFeedback(zoomInBtn);
  addTouchFeedback(zoomOutBtn);
  addTouchFeedback(zoomResetBtn);

  return {
    element,

    setStatus(status: 'loading' | 'ready' | 'error', message?: string) {
      statusDot.className = 'dot';
      if (status === 'loading') {
        statusDot.classList.add('loading');
        statusText.textContent = message || 'Loading...';
      } else if (status === 'error') {
        statusDot.classList.add('error');
        statusText.textContent = message || 'Error';
      } else {
        statusText.textContent = message || 'Ready';
      }
    },

    setRoadCount(count: number) {
      statusText.textContent = `Straight Highway`;
    },

    destroy() {
      zoomInBtn.removeEventListener('click', onZoomIn);
      zoomOutBtn.removeEventListener('click', onZoomOut);
      zoomResetBtn.removeEventListener('click', onZoomReset);
      element.remove();
      legend.remove();
    },
  };
}
