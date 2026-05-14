export interface SamplerOptions {
  text: string;
  font?: string;
  fontWeight?: string;
  width?: number;
  height?: number;
  worldWidth?: number;
  worldHeight?: number;
}

/**
 * Renders text to an offscreen canvas, then samples pixels to produce
 * 3D target positions for particles. The result forms the silhouette of the text.
 */
export class LogoSampler {
  static sample(count: number, opts: SamplerOptions): Float32Array {
    const width = opts.width ?? 1024;
    const height = opts.height ?? 384;
    const worldW = opts.worldWidth ?? 6.0;
    const worldH = opts.worldHeight ?? (worldW * height) / width;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.font = `${opts.fontWeight ?? '900'} ${Math.floor(height * 0.82)}px ${opts.font ?? 'Inter Tight, system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '-0.04em';
    ctx.fillText(opts.text, width / 2, height / 2);

    const img = ctx.getImageData(0, 0, width, height).data;

    const hits: number[] = [];
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        if (img[i] > 128) hits.push(x, y);
      }
    }

    const positions = new Float32Array(count * 3);
    if (hits.length === 0) return positions;

    const hitCount = hits.length / 2;
    for (let p = 0; p < count; p++) {
      const idx = (p % hitCount) * 2;
      const jitterX = (Math.random() - 0.5) * 2.0;
      const jitterY = (Math.random() - 0.5) * 2.0;
      const px = hits[idx] + jitterX;
      const py = hits[idx + 1] + jitterY;

      const x = (px / width - 0.5) * worldW;
      const y = -(py / height - 0.5) * worldH;
      const z = (Math.random() - 0.5) * 0.15;

      positions[p * 3] = x;
      positions[p * 3 + 1] = y;
      positions[p * 3 + 2] = z;
    }

    return positions;
  }

  /**
   * Loads an image, samples non-background pixels, and returns Float32Array
   * of 3D world positions. Pixels are considered "logo" if they're either
   * non-transparent and not pure-white (rgb sum < 720).
   */
  static async sampleImage(
    url: string,
    count: number,
    opts: { worldWidth?: number; worldHeight?: number; jitter?: number } = {},
  ): Promise<Float32Array> {
    const img = await LogoSampler.loadImage(url);

    // Render image to canvas at moderate resolution
    const maxDim = 512;
    const aspect = img.width / img.height;
    const cw = aspect >= 1 ? maxDim : Math.round(maxDim * aspect);
    const ch = aspect >= 1 ? Math.round(maxDim / aspect) : maxDim;

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;

    // World dimensions — square fallback to keep aspect of the logo
    const worldW = opts.worldWidth ?? 3.0;
    const worldH = opts.worldHeight ?? worldW / aspect;
    const jitter = opts.jitter ?? 1.4;

    // Collect logo pixel positions: alpha>100 AND not pure white
    const hits: number[] = [];
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const i = (y * cw + x) * 4;
        const a = data[i + 3];
        if (a < 100) continue;
        const sum = data[i] + data[i + 1] + data[i + 2];
        if (sum > 720) continue; // background (white)
        hits.push(x, y);
      }
    }

    const positions = new Float32Array(count * 3);
    if (hits.length === 0) return positions;

    const hitCount = hits.length / 2;
    for (let p = 0; p < count; p++) {
      const idx = (Math.floor(Math.random() * hitCount)) * 2;
      const jitterX = (Math.random() - 0.5) * jitter;
      const jitterY = (Math.random() - 0.5) * jitter;
      const px = hits[idx] + jitterX;
      const py = hits[idx + 1] + jitterY;

      const x = (px / cw - 0.5) * worldW;
      const y = -(py / ch - 0.5) * worldH;
      const z = (Math.random() - 0.5) * 0.18;

      positions[p * 3]     = x;
      positions[p * 3 + 1] = y;
      positions[p * 3 + 2] = z;
    }

    return positions;
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  static randomStreamPositions(count: number, spread: { x: number; y: number; z: number }): Float32Array {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread.x;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
    }
    return arr;
  }

  static seeds(count: number): Float32Array {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = Math.random();
    return arr;
  }
}
