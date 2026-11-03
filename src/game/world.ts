import * as THREE from 'three';

export interface WorldEnvironment {
  scene: THREE.Scene;
  asteroidMesh: THREE.Mesh;
  roseLight: THREE.PointLight;
  volcanoLights: THREE.PointLight[];
  sunLight: THREE.DirectionalLight;
  getAsteroidRadius: (dir: THREE.Vector3) => number;
  getSurfacePosition: (dir: THREE.Vector3, target?: THREE.Vector3) => THREE.Vector3;
  update: (delta: number, time: number) => void;
}

// Asteroid B-612 base geometry parameters
export const ASTEROID_BASE_RADIUS = 26.0;

// Key landmark locations on Asteroid B-612 (unit directions from center)
export const B612_LOCATIONS = {
  rose: new THREE.Vector3(0, 1, 0).normalize(), // North Pole
  sunsetChair: new THREE.Vector3(0.25, 0.94, 0.22).normalize(),
  volcano1: new THREE.Vector3(0.72, 0.42, 0.55).normalize(), // Active 1 (cooking pot)
  volcano2: new THREE.Vector3(0.45, -0.32, 0.83).normalize(), // Active 2
  volcanoExtinct: new THREE.Vector3(-0.62, 0.35, -0.70).normalize(), // Extinct 3
  baobab: new THREE.Vector3(-0.75, 0.22, 0.62).normalize(),
  fox: new THREE.Vector3(0.48, 0.85, -0.22).normalize(),
  signpost: new THREE.Vector3(-0.25, 0.95, -0.18).normalize(),
};

/**
 * Returns the Asteroid B-612 surface radius for a given directional unit vector.
 * Includes natural craters, the Rose plateau, and volcanic mounds.
 */
export function getAsteroidRadius(dir: THREE.Vector3): number {
  const nx = dir.x;
  const ny = dir.y;
  const nz = dir.z;

  let r = ASTEROID_BASE_RADIUS;

  // 1. Rose Plateau (North Pole): gentle flat elevated mound
  const roseDist = Math.hypot(nx, nz);
  if (ny > 0.85 && roseDist < 0.45) {
    const t = Math.cos((roseDist / 0.45) * (Math.PI / 2));
    r += 0.85 * t;
  }

  // 2. Volcano 1 Mound (Active cooking pot)
  const v1Dist = dir.distanceTo(B612_LOCATIONS.volcano1);
  if (v1Dist < 0.35) {
    const t = Math.cos((v1Dist / 0.35) * (Math.PI / 2));
    // Cone with crater depression in center
    if (v1Dist < 0.08) {
      r += 1.8 * t - 0.7 * Math.cos((v1Dist / 0.08) * (Math.PI / 2));
    } else {
      r += 1.8 * t;
    }
  }

  // 3. Volcano 2 Mound (Active companion)
  const v2Dist = dir.distanceTo(B612_LOCATIONS.volcano2);
  if (v2Dist < 0.28) {
    const t = Math.cos((v2Dist / 0.28) * (Math.PI / 2));
    if (v2Dist < 0.06) {
      r += 1.3 * t - 0.5 * Math.cos((v2Dist / 0.06) * (Math.PI / 2));
    } else {
      r += 1.3 * t;
    }
  }

  // 4. Volcano 3 Mound (Extinct / Dormant)
  const v3Dist = dir.distanceTo(B612_LOCATIONS.volcanoExtinct);
  if (v3Dist < 0.32) {
    const t = Math.cos((v3Dist / 0.32) * (Math.PI / 2));
    r += 1.2 * t;
  }

  // 5. Baobab Hill
  const baobabDist = dir.distanceTo(B612_LOCATIONS.baobab);
  if (baobabDist < 0.4) {
    const t = Math.cos((baobabDist / 0.4) * (Math.PI / 2));
    r += 0.75 * t;
  }

  // 6. Natural low-poly micro-terrain noise
  const noise =
    Math.sin(nx * 4.5 + ny * 3.2) * 0.28 +
    Math.sin(ny * 5.0 + nz * 4.0) * 0.22 +
    Math.cos(nx * 8.0 + nz * 7.5) * 0.15;
  r += noise;

  return r;
}

/**
 * Returns surface position along direction vector.
 */
export function getSurfacePosition(dir: THREE.Vector3, target = new THREE.Vector3()): THREE.Vector3 {
  const norm = dir.clone().normalize();
  const radius = getAsteroidRadius(norm);
  return target.copy(norm).multiplyScalar(radius);
}

/**
 * Helper to position and orient an object flush on Asteroid B-612 surface
 */
export function placeOnAsteroid(
  obj: THREE.Object3D,
  dir: THREE.Vector3,
  altitudeOffset = 0,
  facingTangent?: THREE.Vector3
) {
  const norm = dir.clone().normalize();
  const radius = getAsteroidRadius(norm) + altitudeOffset;
  obj.position.copy(norm).multiplyScalar(radius);

  // Compute orientation matrix where Up is normal
  const up = norm;
  let forward = facingTangent;
  if (!forward) {
    // Generate canonical orthogonal tangent
    const helper = Math.abs(norm.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    forward = new THREE.Vector3().crossVectors(helper, norm).normalize();
  }
  const right = new THREE.Vector3().crossVectors(up, forward).normalize();
  forward.crossVectors(right, up).normalize();

  const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
  obj.quaternion.setFromRotationMatrix(matrix);
}

/**
 * Backward compatibility helper for flat terrain callers
 */
export function getTerrainHeight(x: number, z: number): number {
  const dir = new THREE.Vector3(x, ASTEROID_BASE_RADIUS, z).normalize();
  return getAsteroidRadius(dir) - ASTEROID_BASE_RADIUS;
}

/**
 * Main builder for Asteroid B-612 World
 */
export function buildAsteroidB612(scene: THREE.Scene): WorldEnvironment {
  // 1. Cosmic Deep Space Skybox Background
  scene.background = new THREE.Color('#070714');
  scene.fog = null; // No terrestrial fog in outer space, pristine starfield

  // 2. Starfield with 1200+ twinkling cosmic stars
  buildCosmicStarfield(scene);

  // 3. Distant Ringed Planet & Cosmic Nebula
  buildDistantSpaceScenery(scene);

  // 4. Asteroid B-612 Spherical Terrain
  const { asteroidMesh } = buildAsteroidMesh(scene);

  // 5. The Rose under the Crystal Glass Bell Jar (유리 덮개 속 장미)
  const { roseGroup, roseLight } = buildRoseBellJar(scene);

  // 6. The Three Volcanoes (3개의 화산 - 2개 활화산 + 1개 사화산)
  const { volcanoGroup, volcanoLights, fireParticles } = buildThreeVolcanoes(scene);

  // 7. The Baobab Tree & Baby Sprouts (바오밥나무와 새싹들)
  const baobabGroup = buildBaobabTree(scene);

  // 8. Sunset Viewing Folding Chair (일몰 감상 의자)
  const chairGroup = buildSunsetChair(scene);

  // 9. Asteroid B-612 Vintage Signpost & Golden Star (B612 팻말과 황금 별)
  const signGroup = buildB612Signpost(scene);

  // 10. The Tamed Little Fox (길들여진 여우)
  const foxGroup = buildLittleFox(scene);

  // 11. Scattered Little Asteroid Flora & Wheat Grass Patches
  buildAsteroidFlora(scene);

  // 12. Orbiting Golden Sun & Directional Lighting Rig
  const sunGroup = new THREE.Group();
  const sunLight = new THREE.DirectionalLight('#fff1c2', 2.4);
  sunLight.position.set(45, 30, 40);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 120;
  const d = 36;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0004;
  sunGroup.add(sunLight);

  // Glowing visible Sun Sphere
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#fef08a' })
  );
  sunMesh.position.copy(sunLight.position);
  sunGroup.add(sunMesh);

  // Ambient Fill Light (Deep cosmic indigo and warm starlight)
  const hemiLight = new THREE.HemisphereLight('#c084fc', '#1e1b4b', 0.85);
  scene.add(hemiLight);
  scene.add(sunGroup);

  // Floating Stardust Particles around B-612
  const dustParticles = buildFloatingStardust(scene);

  return {
    scene,
    asteroidMesh,
    roseLight,
    volcanoLights,
    sunLight,
    getAsteroidRadius,
    getSurfacePosition,
    update: (delta: number, time: number) => {
      // 1. Slow cosmic sun orbit creating dynamic sunrise and sunset
      const sunAngle = time * 0.08;
      const sunRadius = 55;
      const sunX = Math.cos(sunAngle) * sunRadius;
      const sunZ = Math.sin(sunAngle) * sunRadius;
      const sunY = Math.sin(sunAngle * 0.5) * 18 + 20;
      sunLight.position.set(sunX, sunY, sunZ);
      sunMesh.position.copy(sunLight.position);

      // 2. Rose romantic gentle pulse & floating aura
      roseLight.intensity = 2.2 + Math.sin(time * 2.5) * 0.5;

      // 3. Volcano flame embers flickering
      volcanoLights.forEach((light, i) => {
        light.intensity = 2.8 + Math.sin(time * 15 + i * 2) * 0.8 + Math.cos(time * 22) * 0.4;
      });

      fireParticles.forEach((p, idx) => {
        p.rotation.y += delta * 2;
        p.scale.y = 0.8 + Math.sin(time * 12 + idx) * 0.35;
      });

      // 4. Stardust orbit animation
      if (dustParticles) {
        dustParticles.rotation.y += delta * 0.03;
        dustParticles.rotation.x += delta * 0.01;
      }
    },
  };
}

export const buildNatureWorld = buildAsteroidB612;

// ==========================================
// SUB-SYSTEM BUILDERS
// ==========================================

/**
 * 1. Asteroid B-612 Low-Poly Spherical Mesh
 */
function buildAsteroidMesh(scene: THREE.Scene) {
  // Use subdivided icosahedron for uniform vertex distribution
  const geo = new THREE.IcosahedronGeometry(ASTEROID_BASE_RADIUS, 5);
  geo.deleteAttribute('normal'); // will recompute for faceted low-poly look

  const pos = geo.attributes.position;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  // Palette colors for Little Prince's asteroid
  const grassSoftGreen = new THREE.Color('#4ade80');
  const mossDeepGreen = new THREE.Color('#15803d');
  const soilTerracotta = new THREE.Color('#f0a868');
  const soilWarmOchre = new THREE.Color('#d97706');
  const volcanoBasalt = new THREE.Color('#332f2c');
  const volcanoCharcoal = new THREE.Color('#1c1917');
  const stoneGrey = new THREE.Color('#78716c');
  const craterSand = new THREE.Color('#fde68a');

  const tmpVec = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    tmpVec.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
    const radius = getAsteroidRadius(tmpVec);
    pos.setXYZ(i, tmpVec.x * radius, tmpVec.y * radius, tmpVec.z * radius);

    // Color assignment by region
    const roseDist = tmpVec.distanceTo(B612_LOCATIONS.rose);
    const v1Dist = tmpVec.distanceTo(B612_LOCATIONS.volcano1);
    const v2Dist = tmpVec.distanceTo(B612_LOCATIONS.volcano2);
    const v3Dist = tmpVec.distanceTo(B612_LOCATIONS.volcanoExtinct);
    const baobabDist = tmpVec.distanceTo(B612_LOCATIONS.baobab);
    const foxDist = tmpVec.distanceTo(B612_LOCATIONS.fox);

    if (v1Dist < 0.28 || v2Dist < 0.22) {
      // Active volcano rock
      tmpColor.copy(volcanoBasalt).lerp(volcanoCharcoal, Math.random() * 0.4);
    } else if (v3Dist < 0.26) {
      // Extinct volcano rock
      tmpColor.copy(stoneGrey).lerp(volcanoBasalt, 0.4);
    } else if (roseDist < 0.38) {
      // Rose grassy plateau
      const t = Math.min(1, roseDist / 0.38);
      tmpColor.copy(grassSoftGreen).lerp(mossDeepGreen, t * 0.5);
    } else if (foxDist < 0.3) {
      // Golden wheat patch for the Fox
      tmpColor.copy(craterSand).lerp(soilWarmOchre, 0.3);
    } else if (baobabDist < 0.36) {
      // Rich soil around Baobab
      tmpColor.copy(soilWarmOchre).lerp(mossDeepGreen, 0.4);
    } else if (tmpVec.y > 0.2) {
      // Upper hemisphere: warm ochre soil blended with grassy patches
      const noise = (Math.sin(tmpVec.x * 12) * Math.cos(tmpVec.z * 12) + 1) * 0.5;
      tmpColor.copy(soilTerracotta).lerp(grassSoftGreen, noise * 0.6);
    } else {
      // Lower hemisphere: warm planetary rock and pastel craters
      const noise = (Math.sin(tmpVec.y * 10) * Math.cos(tmpVec.x * 8) + 1) * 0.5;
      tmpColor.copy(soilTerracotta).lerp(soilWarmOchre, noise * 0.7);
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const asteroidMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });

  const asteroidMesh = new THREE.Mesh(geo, asteroidMat);
  asteroidMesh.receiveShadow = true;
  asteroidMesh.castShadow = true;
  scene.add(asteroidMesh);

  return { asteroidMesh };
}

/**
 * 2. The Rose under the Crystal Glass Bell Jar (유리 덮개 속의 장미)
 */
function buildRoseBellJar(scene: THREE.Scene) {
  const roseGroup = new THREE.Group();
  placeOnAsteroid(roseGroup, B612_LOCATIONS.rose, 0);

  // 1. Stepped Stone Pedestal
  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.7,
    metalness: 0.1,
    flatShading: true,
  });
  const pedestalBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.18, 12), stoneMat);
  pedestalBottom.position.y = 0.09;
  pedestalBottom.receiveShadow = true;
  roseGroup.add(pedestalBottom);

  const pedestalTop = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.75, 0.12, 12), stoneMat);
  pedestalTop.position.y = 0.24;
  pedestalTop.receiveShadow = true;
  roseGroup.add(pedestalTop);

  // Golden Brass Rim
  const brassMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.35,
    metalness: 0.85,
  });
  const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 8, 24), brassMat);
  brassRing.position.y = 0.31;
  brassRing.rotation.x = Math.PI / 2;
  roseGroup.add(brassRing);

  // 2. The Scarlet Rose
  const stemMat = new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.8,
    metalness: 0.05,
  });
  // Slender curved stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.75, 6), stemMat);
  stem.position.set(0.02, 0.68, 0);
  stem.rotation.z = -0.12;
  roseGroup.add(stem);

  // Two delicate green leaves
  for (const [lx, ly, rotZ] of [
    [-0.14, 0.55, 0.6],
    [0.16, 0.68, -0.6],
  ]) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), stemMat);
    leaf.position.set(lx, ly, 0);
    leaf.rotation.z = rotZ;
    leaf.scale.set(1, 1, 0.4);
    roseGroup.add(leaf);
  }

  // Rose Blossom (Layered Petals)
  const petalMatCore = new THREE.MeshStandardMaterial({
    color: '#be123c',
    emissive: '#e11d48',
    emissiveIntensity: 0.4,
    roughness: 0.5,
  });
  const petalMatOuter = new THREE.MeshStandardMaterial({
    color: '#f43f5e',
    roughness: 0.6,
  });

  const bloomGroup = new THREE.Group();
  bloomGroup.position.set(-0.02, 1.05, 0);

  // Inner rose bud
  const coreBud = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), petalMatCore);
  bloomGroup.add(coreBud);

  // Outer spiral petals
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5), i % 2 === 0 ? petalMatCore : petalMatOuter);
    petal.position.set(Math.cos(angle) * 0.1, Math.sin(i) * 0.02, Math.sin(angle) * 0.1);
    petal.scale.set(0.8, 1.2, 0.4);
    petal.rotation.set(0.4, angle, 0);
    bloomGroup.add(petal);
  }
  roseGroup.add(bloomGroup);

  // 3. Crystal Glass Bell Jar (Cloche)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transmission: 0.92,
    opacity: 0.85,
    transparent: true,
    roughness: 0.05,
    ior: 1.48,
    thickness: 0.6,
    clearcoat: 1.0,
    depthWrite: false,
  });

  const clocheCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.95, 24, 1, true), glassMat);
  clocheCylinder.position.y = 0.8;
  roseGroup.add(clocheCylinder);

  const clocheDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  clocheDome.position.y = 1.28;
  roseGroup.add(clocheDome);

  // Glass knob handle on top
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), glassMat);
  knob.position.y = 1.88;
  roseGroup.add(knob);

  // Rose Warm Glow Light
  const roseLight = new THREE.PointLight('#f43f5e', 2.4, 9, 1.6);
  roseLight.position.set(0, 1.1, 0);
  roseGroup.add(roseLight);

  scene.add(roseGroup);
  return { roseGroup, roseLight };
}

/**
 * 3. The Three Volcanoes (3개의 화산 - 활화산 2개 + 사화산 1개)
 */
function buildThreeVolcanoes(scene: THREE.Scene) {
  const volcanoGroup = new THREE.Group();
  const volcanoLights: THREE.PointLight[] = [];
  const fireParticles: THREE.Mesh[] = [];

  const basaltMat = new THREE.MeshStandardMaterial({
    color: '#292524',
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  });

  const lavaMat = new THREE.MeshStandardMaterial({
    color: '#f97316',
    emissive: '#ffedd5',
    emissiveIntensity: 2.0,
    roughness: 0.2,
  });

  const flameMat = new THREE.MeshBasicMaterial({
    color: '#facc15',
  });

  // A. Active Volcano 1 (The Prince's cooking volcano with breakfast pot)
  const v1 = new THREE.Group();
  placeOnAsteroid(v1, B612_LOCATIONS.volcano1, 0);

  const cone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.8, 1.4, 10, 1, true), basaltMat);
  cone1.position.y = 0.7;
  cone1.castShadow = true;
  cone1.receiveShadow = true;
  v1.add(cone1);

  // Molten lava pool inside crater
  const lava1 = new THREE.Mesh(new THREE.CircleGeometry(0.72, 12), lavaMat);
  lava1.position.y = 1.15;
  lava1.rotation.x = -Math.PI / 2;
  v1.add(lava1);

  // Cast iron cooking pot (for heating morning breakfast!)
  const ironMat = new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.6,
    metalness: 0.8,
  });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.35, 10), ironMat);
  pot.position.set(0.18, 1.35, 0.1);
  pot.castShadow = true;
  v1.add(pot);
  // Pot handle
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 12, Math.PI), ironMat);
  handle.position.set(0.18, 1.55, 0.1);
  v1.add(handle);

  // Embers / Flames
  for (let i = 0; i < 4; i++) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 5), flameMat);
    flame.position.set((Math.random() - 0.5) * 0.4, 1.35, (Math.random() - 0.5) * 0.4);
    v1.add(flame);
    fireParticles.push(flame);
  }

  const v1Light = new THREE.PointLight('#f97316', 3.0, 10, 1.5);
  v1Light.position.set(0, 1.6, 0);
  v1.add(v1Light);
  volcanoLights.push(v1Light);
  volcanoGroup.add(v1);

  // B. Active Volcano 2 (Small companion volcano)
  const v2 = new THREE.Group();
  placeOnAsteroid(v2, B612_LOCATIONS.volcano2, 0);

  const cone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.3, 1.0, 8, 1, true), basaltMat);
  cone2.position.y = 0.5;
  cone2.castShadow = true;
  v2.add(cone2);

  const lava2 = new THREE.Mesh(new THREE.CircleGeometry(0.5, 10), lavaMat);
  lava2.position.y = 0.85;
  lava2.rotation.x = -Math.PI / 2;
  v2.add(lava2);

  for (let i = 0; i < 3; i++) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), flameMat);
    flame.position.set((Math.random() - 0.5) * 0.3, 1.0, (Math.random() - 0.5) * 0.3);
    v2.add(flame);
    fireParticles.push(flame);
  }

  const v2Light = new THREE.PointLight('#ea580c', 2.2, 8, 1.5);
  v2Light.position.set(0, 1.2, 0);
  v2.add(v2Light);
  volcanoLights.push(v2Light);
  volcanoGroup.add(v2);

  // C. Extinct Volcano 3 (Used as a stool by the Little Prince)
  const v3 = new THREE.Group();
  placeOnAsteroid(v3, B612_LOCATIONS.volcanoExtinct, 0);

  const stoneExtinctMat = new THREE.MeshStandardMaterial({
    color: '#57534e',
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const cone3 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 0.85, 8), stoneExtinctMat);
  cone3.position.y = 0.42;
  cone3.castShadow = true;
  cone3.receiveShadow = true;
  v3.add(cone3);

  // Stool wooden seat cushion on top of extinct crater
  const woodMat = new THREE.MeshStandardMaterial({
    color: '#854d0e',
    roughness: 0.8,
  });
  const stoolPlank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 10), woodMat);
  stoolPlank.position.y = 0.88;
  v3.add(stoolPlank);

  volcanoGroup.add(v3);
  scene.add(volcanoGroup);

  return { volcanoGroup, volcanoLights, fireParticles };
}

/**
 * 4. The Baobab Tree & Baby Sprouts (바오밥나무와 새싹들)
 */
function buildBaobabTree(scene: THREE.Scene) {
  const baobabGroup = new THREE.Group();
  placeOnAsteroid(baobabGroup, B612_LOCATIONS.baobab, 0);

  const trunkMat = new THREE.MeshStandardMaterial({
    color: '#713f12',
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: '#4d7c0f',
    roughness: 0.7,
    flatShading: true,
  });

  // Iconic bulbous swollen trunk
  const trunkBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.6, 8), trunkMat);
  trunkBase.position.y = 0.8;
  trunkBase.castShadow = true;
  baobabGroup.add(trunkBase);

  const trunkWaist = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 1.4, 8), trunkMat);
  trunkWaist.position.y = 2.1;
  trunkWaist.castShadow = true;
  baobabGroup.add(trunkWaist);

  // Branches
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.3, 6), trunkMat);
    branch.position.set(Math.cos(angle) * 0.45, 3.1, Math.sin(angle) * 0.45);
    branch.rotation.set(0.4 * Math.sin(angle), angle, 0.4 * Math.cos(angle));
    branch.castShadow = true;
    baobabGroup.add(branch);

    // Umbrella foliage canopy
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), canopyMat);
    canopy.position.set(Math.cos(angle) * 0.9, 3.8, Math.sin(angle) * 0.9);
    canopy.scale.set(1.4, 0.65, 1.4);
    canopy.castShadow = true;
    baobabGroup.add(canopy);
  }

  // Central top canopy
  const topCanopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), canopyMat);
  topCanopy.position.y = 4.2;
  topCanopy.scale.set(1.5, 0.7, 1.5);
  topCanopy.castShadow = true;
  baobabGroup.add(topCanopy);

  // Tiny Baobab Sprouts nearby (The Prince weeds them every morning!)
  const sproutMat = new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.6 });
  for (const [sx, sz] of [
    [1.8, 0.6],
    [-1.5, 1.2],
    [0.8, -1.7],
  ]) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.28, 5), sproutMat);
    stem.position.set(sx, 0.14, sz);
    baobabGroup.add(stem);

    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), sproutMat);
    leaf1.position.set(sx - 0.08, 0.32, sz);
    leaf1.scale.set(1, 0.3, 0.6);
    baobabGroup.add(leaf1);

    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), sproutMat);
    leaf2.position.set(sx + 0.08, 0.32, sz);
    leaf2.scale.set(1, 0.3, 0.6);
    baobabGroup.add(leaf2);
  }

  // Little brass weeding shovel stuck in the ground
  const shovelMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8, roughness: 0.3 });
  const handleMat = new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.7 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.03), shovelMat);
  blade.position.set(1.2, 0.15, 0.9);
  blade.rotation.set(0.3, 0.4, 0.2);
  baobabGroup.add(blade);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55), handleMat);
  handle.position.set(1.28, 0.45, 0.96);
  handle.rotation.set(0.3, 0.4, 0.2);
  baobabGroup.add(handle);

  scene.add(baobabGroup);
  return baobabGroup;
}

/**
 * 5. Sunset Viewing Folding Chair (일몰 감상 의자)
 */
function buildSunsetChair(scene: THREE.Scene) {
  const chairGroup = new THREE.Group();
  placeOnAsteroid(chairGroup, B612_LOCATIONS.sunsetChair, 0);

  const woodMat = new THREE.MeshStandardMaterial({
    color: '#b45309',
    roughness: 0.7,
    flatShading: true,
  });

  // Chair legs (X-frame folding chair)
  for (const zOff of [-0.25, 0.25]) {
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.05), woodMat);
    leg1.position.set(0, 0.35, zOff);
    leg1.rotation.z = 0.3;
    leg1.castShadow = true;
    chairGroup.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.05), woodMat);
    leg2.position.set(0, 0.35, zOff);
    leg2.rotation.z = -0.3;
    leg2.castShadow = true;
    chairGroup.add(leg2);
  }

  // Canvas / Slatted Seat
  const seatMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    roughness: 0.8,
  });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), seatMat);
  seat.position.set(0, 0.52, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  // Backrest
  const backPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), woodMat);
  backPost1.position.set(-0.25, 0.8, -0.24);
  backPost1.rotation.z = -0.15;
  chairGroup.add(backPost1);

  const backPost2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), woodMat);
  backPost2.position.set(-0.25, 0.8, 0.24);
  backPost2.rotation.z = -0.15;
  chairGroup.add(backPost2);

  const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.55), seatMat);
  backRest.position.set(-0.28, 0.95, 0);
  backRest.rotation.z = -0.15;
  chairGroup.add(backRest);

  scene.add(chairGroup);
  return chairGroup;
}

/**
 * 6. Asteroid B-612 Vintage Signpost & Golden Star (B612 팻말과 황금 별)
 */
function buildB612Signpost(scene: THREE.Scene) {
  const signGroup = new THREE.Group();
  placeOnAsteroid(signGroup, B612_LOCATIONS.signpost, 0);

  const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 6), woodMat);
  post.position.y = 0.9;
  post.castShadow = true;
  signGroup.add(post);

  // Signboard Plaque
  const boardMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.5, metalness: 0.2 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.08), boardMat);
  board.position.set(0, 1.4, 0.08);
  board.castShadow = true;
  signGroup.add(board);

  // Golden 5-Pointed Star on top
  const starMat = new THREE.MeshStandardMaterial({
    color: '#facc15',
    emissive: '#eab308',
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.2,
  });
  const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), starMat);
  star.position.y = 1.95;
  signGroup.add(star);

  scene.add(signGroup);
  return signGroup;
}

/**
 * 7. The Tamed Little Fox (길들여진 여우)
 */
function buildLittleFox(scene: THREE.Scene) {
  const foxGroup = new THREE.Group();
  placeOnAsteroid(foxGroup, B612_LOCATIONS.fox, 0);

  const foxOrange = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.7, flatShading: true });
  const foxWhite = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.6, flatShading: true });
  const foxBlack = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.4 });

  // Body (sitting gracefully)
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6), foxOrange);
  body.position.y = 0.28;
  body.castShadow = true;
  foxGroup.add(body);

  // White chest bib
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 5), foxWhite);
  chest.position.set(0.12, 0.32, 0);
  chest.scale.set(0.6, 1.0, 0.8);
  foxGroup.add(chest);

  // Head
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 5), foxOrange);
  head.position.set(0.15, 0.58, 0);
  head.rotation.z = -Math.PI / 2.2;
  foxGroup.add(head);

  // Snout
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), foxBlack);
  nose.position.set(0.33, 0.58, 0);
  foxGroup.add(nose);

  // Big expressive ears
  for (const ez of [-0.12, 0.12]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 4), foxOrange);
    ear.position.set(0.08, 0.74, ez);
    ear.rotation.set(0, 0, -0.15);
    foxGroup.add(ear);

    const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 4), foxBlack);
    earTip.position.set(0.08, 0.82, ez);
    foxGroup.add(earTip);
  }

  // Long fluffy bushy tail curled around body
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.6, 6), foxOrange);
  tail.position.set(-0.25, 0.18, 0.15);
  tail.rotation.set(0.4, 0.6, 0.8);
  foxGroup.add(tail);

  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), foxWhite);
  tailTip.position.set(-0.35, 0.32, 0.25);
  tailTip.rotation.set(0.4, 0.6, 0.8);
  foxGroup.add(tailTip);

  scene.add(foxGroup);
  return foxGroup;
}

/**
 * 8. Scattered Flora & Golden Wheat Grass Patches
 */
function buildAsteroidFlora(scene: THREE.Scene) {
  const wheatMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.7 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.5 });

  // Distribute 45 small clusters across the sphere surface
  for (let i = 0; i < 45; i++) {
    // Generate random point on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );

    // Keep clear of volcanoes
    if (
      dir.distanceTo(B612_LOCATIONS.volcano1) < 0.35 ||
      dir.distanceTo(B612_LOCATIONS.volcano2) < 0.3
    ) {
      continue;
    }

    const floraGroup = new THREE.Group();
    placeOnAsteroid(floraGroup, dir, 0);

    const isWheat = Math.random() < 0.6;
    if (isWheat) {
      // Golden wheat grass clump
      for (let j = 0; j < 4; j++) {
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.35 + Math.random() * 0.2, 4), wheatMat);
        blade.position.set((Math.random() - 0.5) * 0.2, 0.18, (Math.random() - 0.5) * 0.2);
        blade.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * 3, (Math.random() - 0.5) * 0.3);
        floraGroup.add(blade);
      }
    } else {
      // Little starlight blue flower
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4), wheatMat);
      stem.position.y = 0.12;
      floraGroup.add(stem);
      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), flowerMat);
      bloom.position.y = 0.26;
      floraGroup.add(bloom);
    }

    scene.add(floraGroup);
  }
}

/**
 * 9. Cosmic Starfield (1200+ stars)
 */
function buildCosmicStarfield(scene: THREE.Scene) {
  const starCount = 1200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const starTints = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#fef08a'), // warm golden
    new THREE.Color('#bae6fd'), // soft blue
    new THREE.Color('#fbcfe8'), // soft rose
    new THREE.Color('#fed7aa'), // warm amber
  ];

  for (let i = 0; i < starCount; i++) {
    // Distribute on far celestial sphere (radius 300 to 450)
    const dist = 320 + Math.random() * 150;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * 80 + dist;
    const sinPhi = Math.sin(phi);

    starPos[i * 3] = r * sinPhi * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * sinPhi * Math.sin(theta);

    const tint = starTints[Math.floor(Math.random() * starTints.length)];
    starColors[i * 3] = tint.r;
    starColors[i * 3 + 1] = tint.g;
    starColors[i * 3 + 2] = tint.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
}

/**
 * 10. Distant Ringed Planet & Cosmic Space Scenery
 */
function buildDistantSpaceScenery(scene: THREE.Scene) {
  const sceneryGroup = new THREE.Group();

  // Distant majestic Ringed Planet (King's or Geographer's planet)
  const planetGeo = new THREE.SphereGeometry(18, 24, 24);
  const planetMat = new THREE.MeshStandardMaterial({
    color: '#a78bfa',
    roughness: 0.8,
    metalness: 0.1,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.set(-160, 90, -180);
  sceneryGroup.add(planet);

  // Saturn-like planet rings
  const ringGeo = new THREE.RingGeometry(24, 38, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#e9d5ff',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.6;
  ring.rotation.y = 0.3;
  planet.add(ring);

  // Distant tiny baby asteroid companion
  const miniAsteroid = new THREE.Mesh(
    new THREE.DodecahedronGeometry(5.5, 1),
    new THREE.MeshStandardMaterial({ color: '#78716c', roughness: 0.9 })
  );
  miniAsteroid.position.set(140, -60, -150);
  sceneryGroup.add(miniAsteroid);

  scene.add(sceneryGroup);
}

/**
 * 11. Floating Cosmic Stardust Particles around B-612
 */
function buildFloatingStardust(scene: THREE.Scene): THREE.Points {
  const count = 350;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const gold = new THREE.Color('#facc15');
  const cyan = new THREE.Color('#67e8f9');
  const rose = new THREE.Color('#f472b6');

  for (let i = 0; i < count; i++) {
    // Radius slightly above asteroid surface (30 to 45)
    const r = 30 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const c = Math.random() < 0.5 ? gold : Math.random() < 0.8 ? cyan : rose;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}
