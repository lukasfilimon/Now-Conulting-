import { Scene as ThreeScene, AmbientLight, DirectionalLight, Object3D } from 'three';

export class Scene {
  readonly root: ThreeScene;

  constructor() {
    this.root = new ThreeScene();
    this.setupLighting();
  }

  private setupLighting(): void {
    const ambient = new AmbientLight(0xffffff, 0.4);
    this.root.add(ambient);

    // Brand gold lights
    const key = new DirectionalLight(0xe2c97a, 1.2);  // gold-light
    key.position.set(3, 5, 4);
    this.root.add(key);

    const rim = new DirectionalLight(0xc9a84c, 0.6);  // brand gold
    rim.position.set(-4, 2, -3);
    this.root.add(rim);
  }

  add(...objects: Object3D[]): void {
    this.root.add(...objects);
  }

  remove(...objects: Object3D[]): void {
    this.root.remove(...objects);
  }
}
