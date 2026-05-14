/**
 * AudioManager — v1 stub (no audio shipped).
 * Howler.js wird in Iteration 2 lazy-loaded wenn Audio-Layer aktiviert wird.
 * Diese Stub-Version verhindert dass Howler in den Production-Bundle landet.
 */
export interface AudioTrack {
  key: string;
  src: string[];
  loop?: boolean;
  volume?: number;
}

export class AudioManager {
  private muted = true;

  constructor() {
    // No-op in v1
  }

  register(_track: AudioTrack): void {
    // Stub
  }

  play(_key: string): void {
    // Stub
  }

  stop(_key: string): void {
    // Stub
  }

  fade(_key: string, _from: number, _to: number, _durationMs: number): void {
    // Stub
  }

  setVolume(_key: string, _volume: number): void {
    // Stub
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  onMuteChange(_cb: (muted: boolean) => void): () => void {
    return () => {};
  }

  dispose(): void {
    // Stub
  }
}
