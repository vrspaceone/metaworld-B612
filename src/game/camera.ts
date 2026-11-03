import * as THREE from 'three';
import { CameraPreset } from '../types/game.ts';
import { getAsteroidRadius } from './world.ts';

export class ThirdPersonCamera {
  private camera: THREE.PerspectiveCamera;
  private currentPosition = new THREE.Vector3(0, 32, 10);
  private currentLookAt = new THREE.Vector3(0, 27, 0);
  private currentUp = new THREE.Vector3(0, 1, 0);

  // Spherical orbit angles relative to character's local surface normal
  public theta: number = 0; // horizontal azimuth angle around surface normal
  public phi: number = 0.40; // pitch elevation angle above tangent horizon (radians)
  public distance: number = 7.5;
  public targetHeight: number = 1.35;

  private presetConfigs: Record<CameraPreset, { distance: number; height: number; phi: number }> = {
    close: { distance: 4.2, height: 1.3, phi: 0.32 },
    normal: { distance: 7.5, height: 1.35, phi: 0.40 },
    far: { distance: 14.0, height: 1.5, phi: 0.52 },
    top: { distance: 38.0, height: 1.0, phi: 0.85 }, // Asteroid Whole Planet Orbit View
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
    // DeltaX rotates theta (horizontal around surface normal)
    this.theta -= deltaX * 0.0035;

    // DeltaY rotates phi (vertical pitch clamped to avoid upside-down flip or floor clipping)
    this.phi += deltaY * 0.0035;
    this.phi = Math.max(0.12, Math.min(1.45, this.phi));
  }

  public zoom(deltaZoom: number) {
    this.distance = Math.max(3.2, Math.min(48, this.distance + deltaZoom * 0.006));
  }

  public update(targetPos: THREE.Vector3, delta: number) {
    // 1. Surface normal at the character's position
    const norm = targetPos.clone().normalize();
    if (norm.lengthSq() < 0.001) norm.set(0, 1, 0);

    // 2. Character look-at target elevated along surface normal
    const idealLookAt = targetPos.clone().add(norm.clone().multiplyScalar(this.targetHeight));

    // 3. Orthonormal tangent frame at player position
    const helper = Math.abs(norm.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const east = new THREE.Vector3().crossVectors(helper, norm).normalize();
    const north = new THREE.Vector3().crossVectors(norm, east).normalize();

    // 4. Azimuth direction on the local tangent plane (behind character)
    const azimuthDir = new THREE.Vector3()
      .addScaledVector(north, Math.cos(this.theta))
      .addScaledVector(east, Math.sin(this.theta))
      .normalize();

    // 5. Ideal camera position in 3D world space
    const horizontalDist = this.distance * Math.cos(this.phi);
    const verticalDist = this.distance * Math.sin(this.phi);

    const idealPosition = idealLookAt
      .clone()
      .addScaledVector(norm, verticalDist)
      .addScaledVector(azimuthDir, horizontalDist);

    // 6. Collision safety with Asteroid B-612 surface
    const camDir = idealPosition.clone().normalize();
    const minSafeRadius = getAsteroidRadius(camDir) + 1.25;
    if (idealPosition.length() < minSafeRadius) {
      idealPosition.copy(camDir.multiplyScalar(minSafeRadius));
    }

    // 7. Smooth exponential interpolation
    const dampRate = Math.min(1, delta * 10);
    this.currentPosition.lerp(idealPosition, dampRate);
    this.currentLookAt.lerp(idealLookAt, dampRate);
    this.currentUp.lerp(norm, dampRate).normalize();

    this.camera.position.copy(this.currentPosition);
    this.camera.up.copy(this.currentUp);
    this.camera.lookAt(this.currentLookAt);
  }
}
