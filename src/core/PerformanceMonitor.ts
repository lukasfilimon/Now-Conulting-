export interface PerfSample {
  fps: number;
  ms: number;
  memMB: number | null;
}

interface MemoryInfo {
  usedJSHeapSize: number;
}

type PerfWithMemory = Performance & { memory?: MemoryInfo };

export class PerformanceMonitor {
  private frames = 0;
  private lastT = performance.now();
  private acc = 0;
  private current: PerfSample = { fps: 0, ms: 0, memMB: null };
  private overlay: HTMLElement | null;
  private lowFpsListeners = new Set<(fps: number) => void>();
  private lowFpsThreshold = 30;
  private lowFpsStreak = 0;

  constructor(overlayId = 'perf') {
    this.overlay = document.getElementById(overlayId);
  }

  tick(): void {
    this.frames++;
    const now = performance.now();
    const dt = now - this.lastT;
    this.acc += dt;
    this.lastT = now;

    if (this.acc >= 500) {
      const fps = (this.frames * 1000) / this.acc;
      const perf = performance as PerfWithMemory;
      const mem = perf.memory ? perf.memory.usedJSHeapSize / 1048576 : null;
      this.current = {
        fps: Math.round(fps),
        ms: Math.round(dt * 10) / 10,
        memMB: mem ? Math.round(mem) : null,
      };

      if (fps < this.lowFpsThreshold) {
        this.lowFpsStreak++;
        if (this.lowFpsStreak >= 3) {
          this.lowFpsListeners.forEach((cb) => cb(fps));
          this.lowFpsStreak = 0;
        }
      } else {
        this.lowFpsStreak = 0;
      }

      this.updateOverlay();
      this.frames = 0;
      this.acc = 0;
    }
  }

  private updateOverlay(): void {
    if (!this.overlay) return;
    const { fps, ms, memMB } = this.current;
    this.overlay.textContent = `${fps} fps · ${ms}ms${memMB !== null ? ` · ${memMB}MB` : ''}`;
  }

  onLowFps(cb: (fps: number) => void): () => void {
    this.lowFpsListeners.add(cb);
    return () => this.lowFpsListeners.delete(cb);
  }

  get sample(): PerfSample {
    return { ...this.current };
  }
}
