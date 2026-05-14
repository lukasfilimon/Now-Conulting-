import {
  Texture,
  TextureLoader,
  BufferGeometry,
  Material,
  Object3D,
} from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

type Disposable = Texture | BufferGeometry | Material;

export class AssetManager {
  private textures = new Map<string, Texture>();
  private models = new Map<string, GLTF>();
  private tracked = new Set<Disposable>();
  private texLoader: TextureLoader;
  private gltfLoader: GLTFLoader;

  constructor() {
    this.texLoader = new TextureLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(draco);
  }

  async loadTexture(url: string, key?: string): Promise<Texture> {
    const cacheKey = key ?? url;
    const cached = this.textures.get(cacheKey);
    if (cached) return cached;

    const tex = await this.texLoader.loadAsync(url);
    this.textures.set(cacheKey, tex);
    this.tracked.add(tex);
    return tex;
  }

  async loadModel(url: string, key?: string): Promise<GLTF> {
    const cacheKey = key ?? url;
    const cached = this.models.get(cacheKey);
    if (cached) return cached;

    const gltf = await this.gltfLoader.loadAsync(url);
    this.models.set(cacheKey, gltf);
    this.trackSceneAssets(gltf.scene);
    return gltf;
  }

  private trackSceneAssets(scene: Object3D): void {
    scene.traverse((obj: Object3D) => {
      const mesh = obj as { geometry?: BufferGeometry; material?: Material | Material[] };
      if (mesh.geometry) this.tracked.add(mesh.geometry);
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => this.tracked.add(m));
      }
    });
  }

  track(...assets: Disposable[]): void {
    assets.forEach((a) => this.tracked.add(a));
  }

  release(asset: Disposable): void {
    asset.dispose();
    this.tracked.delete(asset);
  }

  releaseAll(): void {
    this.tracked.forEach((asset) => asset.dispose());
    this.tracked.clear();
    this.textures.clear();
    this.models.clear();
  }

  get stats() {
    return {
      textures: this.textures.size,
      models: this.models.size,
      tracked: this.tracked.size,
    };
  }
}
