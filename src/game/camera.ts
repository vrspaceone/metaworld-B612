import * as THREE from 'three';
import { CameraPreset } from '../types/game.ts';
import { getTerrainHeight } from './world.ts';

export class ThirdPersonCamera {
  private camera: THREE.PerspectiveCamera;
  private currentPosition = new THREE.Vector3(0, 5, 10);
  private currentLookAt = new THREE.Vector3(0, 1.2, 0);

  // Spherical orbit angles
  public theta: number = 0; // horizontal azimuth
  public phi: number = 0.35; // vertical pitch (radians from horizontal)
  public distance: number = 6.2;
  public targetHeight: number = 1.35;

  private presetConfigs: Record<CameraPreset, { distance: number; height: number; phi: number }> = {
    close: { distance: 3.6, height: 1.4, phi: 0.28 },
    normal: { distance: 6.2, height: 1.35, phi: 0.35 },
    far: { distance: 11.0, height: 1.5, phi: 0.45 },
    top: { distance: 16.0, height: 1.2, phi: 1.15 },
  };

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public setPreset(preset: CameraPreset) {
    const config = this.presetConfigs[preset];
    if (config) {
      this.distance = config.distance;
      this.targetHeight = config.height;
      this.phi = config.phi;
    }
  }

  public rotate(deltaX: number, deltaY: number) {
    // DeltaX rotates theta (horizontal)
    this.theta -= deltaX * 0.0035;

    // DeltaY rotates phi (vertical, clamped to avoid gimbal lock or floor dive)
    this.phi += deltaY * 0.0035;
    this.phi = Math.max(0.08, Math.min(1.42, this.phi));
  }

  public zoom(deltaZoom: number) {
    this.distance = Math.max(2.5, Math.min(20, this.distance + deltaZoom * 0.004));
  }

  public update(targetPos: THREE.Vector3, delta: number) {
    // Desired look-at target (character chest/head level)
    const idealLookAt = new THREE.Vector3(
      targetPos.x,
      targetPos.y + this.targetHeight,
      targetPos.z
    );

    // Calculate ideal camera position based on spherical coordinates
    const horizontalDist = this.distance * Math.cos(this.phi);
    const verticalDist = this.distance * Math.sin(this.phi);

    const idealX = idealLookAt.x + Math.sin(this.theta) * horizontalDist;
    const idealY = idealLookAt.y + verticalDist;
    const idealZ = idealLookAt.z + Math.cos(this.theta) * horizontalDist;

    // Check terrain collision so camera never clips into ground
    const terrainFloor = getTerrainHeight(idealX, idealZ) + 0.65;
    const safeY = Math.max(idealY, terrainFloor);

    // Smooth exponential damping
    const dampRate = 9;
    this.currentPosition.x = THREE.MathUtils.damp(this.currentPosition.x, idealX, dampRate, delta);
    this.currentPosition.y = THREE.MathUtils.damp(this.currentPosition.y, safeY, dampRate, delta);
    this.currentPosition.z = THREE.MathUtils.damp(this.currentPosition.z, idealZ, dampRate, delta);

    this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, idealLookAt.x, dampRate, delta);
    this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, idealLookAt.y, dampRate, delta);
    this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, idealLookAt.z, dampRate, delta);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}
