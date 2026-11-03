import * as THREE from 'three';

export interface WorldEnvironment {
  scene: THREE.Scene;
  terrainMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  campfireLight: THREE.PointLight;
  fireGroup: THREE.Group;
  getTerrainHeight: (x: number, z: number) => number;
  update: (delta: number, time: number) => void;
}

/**
 * Calculates terrain elevation at given world coordinate (x, z).
 * Guaranteed smooth basin around campfire and natural outer hills.
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.hypot(x, z);

  // Central campfire plaza (within 12 units) is flat, spacious, and safe
  if (distFromCenter < 12) {
    return 0;
  }

  // Lake depression around (18, -12)
  const lakeDist = Math.hypot(x - 18, z + 12);
  if (lakeDist < 9.5) {
    const depth = Math.cos((lakeDist / 9.5) * (Math.PI / 2));
    return -0.8 * depth;
  }

  // Gentle rolling hills
  let h = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.2;
  h += Math.sin((x + 10) * 0.03 + (z - 5) * 0.04) * 2.2;

  // Natural valley edge steepening past 38 units
  if (distFromCenter > 38) {
    const wallFactor = (distFromCenter - 38) * 0.35;
    h += wallFactor * wallFactor;
  }

  // Blend transition from flat plaza to hills
  if (distFromCenter < 18) {
    const t = (distFromCenter - 12) / 6;
    return h * t;
  }

  return h;
}

export function buildNatureWorld(scene: THREE.Scene): WorldEnvironment {
  // 1. Terrain Geometry
  const terrainSize = 130;
  const terrainSegments = 70;
  const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  // Palette colors for low-poly vertex painting
  const grassGreen = new THREE.Color('#4d8851');
  const hillDarkGreen = new THREE.Color('#396b3d');
  const pathSand = new THREE.Color('#c4aa82');
  const lakeSand = new THREE.Color('#8fa892');
  const rockGrey = new THREE.Color('#78716c');

  const tmpColor = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = getTerrainHeight(vx, vz);
    posAttr.setY(i, vy);

    const distFromCenter = Math.hypot(vx, vz);
    const lakeDist = Math.hypot(vx - 18, vz + 12);

    if (lakeDist < 10) {
      tmpColor.copy(lakeSand).lerp(pathSand, Math.min(1, lakeDist / 10));
    } else if (distFromCenter < 5.5) {
      tmpColor.copy(pathSand);
    } else if (distFromCenter < 8) {
      const t = (distFromCenter - 5.5) / 2.5;
      tmpColor.copy(pathSand).lerp(grassGreen, t);
    } else if (vy > 4.5) {
      tmpColor.copy(rockGrey).lerp(hillDarkGreen, 0.4);
    } else {
      // Grass with slight elevation variation
      const noise = (Math.sin(vx * 0.5) * Math.cos(vz * 0.5) + 1) * 0.15;
      tmpColor.copy(grassGreen).lerp(hillDarkGreen, noise + Math.min(0.4, vy * 0.1));
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // 2. Lake Water Surface
  const waterGeo = new THREE.CircleGeometry(8.5, 32);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#38bdf8'),
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.82,
    flatShading: true,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(18, -0.15, -12);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // Wooden Pier / Dock extending into lake
  const pierGroup = new THREE.Group();
  pierGroup.position.set(13.2, 0.1, -12);
  pierGroup.rotation.y = 0.2;

  const woodMat = new THREE.MeshStandardMaterial({
    color: '#854d0e',
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true,
  });

  const plankGeo = new THREE.BoxGeometry(1.4, 0.12, 3.8);
  const plank = new THREE.Mesh(plankGeo, woodMat);
  plank.castShadow = true;
  plank.receiveShadow = true;
  pierGroup.add(plank);

  // Pier support posts
  for (const xOff of [-0.6, 0.6]) {
    for (const zOff of [-1.6, 0, 1.6]) {
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(xOff, -0.4, zOff);
      post.castShadow = true;
      pierGroup.add(post);
    }
  }
  scene.add(pierGroup);

  // 3. Central Campfire Landmark
  const campfireGroup = new THREE.Group();
  campfireGroup.position.set(0, 0, 0);

  // Ring of 9 low-poly stones
  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  });

  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const r = 1.05 + Math.sin(i * 3) * 0.12;
    const stoneGeo = new THREE.DodecahedronGeometry(0.24, 0);
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(Math.cos(angle) * r, 0.12, Math.sin(angle) * r);
    stone.rotation.set(angle, Math.sin(i), Math.cos(i));
    stone.scale.set(1 + Math.sin(i) * 0.3, 0.8, 1 + Math.cos(i) * 0.2);
    stone.castShadow = true;
    stone.receiveShadow = true;
    campfireGroup.add(stone);
  }

  // Firewood Logs
  const logMat = new THREE.MeshStandardMaterial({
    color: '#573016',
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const logGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.1, 6);
    const log = new THREE.Mesh(logGeo, logMat);
    log.position.set(Math.cos(angle) * 0.25, 0.15, Math.sin(angle) * 0.25);
    log.rotation.set(0.35 * Math.sin(angle), angle, 0.35 * Math.cos(angle));
    log.castShadow = true;
    campfireGroup.add(log);
  }

  // Animated Fire Crystals / Flames
  const fireGroup = new THREE.Group();
  fireGroup.position.set(0, 0.25, 0);

  const flameMatCore = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#facc15',
    emissiveIntensity: 2.2,
    roughness: 0.2,
    flatShading: true,
  });

  const flameMatOuter = new THREE.MeshStandardMaterial({
    color: '#ea580c',
    emissive: '#f97316',
    emissiveIntensity: 1.8,
    roughness: 0.3,
    flatShading: true,
  });

  for (let i = 0; i < 6; i++) {
    const fGeo = new THREE.ConeGeometry(0.12 + Math.random() * 0.08, 0.5 + Math.random() * 0.3, 5);
    const flame = new THREE.Mesh(fGeo, i % 2 === 0 ? flameMatCore : flameMatOuter);
    flame.position.set(
      (Math.random() - 0.5) * 0.3,
      0.2 + Math.random() * 0.15,
      (Math.random() - 0.5) * 0.3
    );
    flame.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * Math.PI,
      (Math.random() - 0.5) * 0.3
    );
    fireGroup.add(flame);
  }
  campfireGroup.add(fireGroup);

  // Warm Campfire Point Light
  const campfireLight = new THREE.PointLight('#f97316', 3.2, 14, 1.4);
  campfireLight.position.set(0, 0.7, 0);
  campfireLight.castShadow = true;
  campfireLight.shadow.bias = -0.002;
  campfireGroup.add(campfireLight);

  // 4 Log Benches around campfire
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const benchDist = 3.2;
    const benchGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.2, 7);
    const bench = new THREE.Mesh(benchGeo, logMat);
    bench.position.set(Math.cos(angle) * benchDist, 0.22, Math.sin(angle) * benchDist);
    bench.rotation.set(0, angle + Math.PI / 2, Math.PI / 2);
    bench.castShadow = true;
    bench.receiveShadow = true;
    campfireGroup.add(bench);
  }

  scene.add(campfireGroup);

  // 4. Instanced Pine Trees and Broadleaf Trees
  buildFoliage(scene);

  return {
    scene,
    terrainMesh,
    waterMesh,
    campfireLight,
    fireGroup,
    getTerrainHeight,
    update: (delta: number, time: number) => {
      // Flame animation (flicker and scale bobbing)
      const flicker = 2.8 + Math.sin(time * 18) * 0.6 + Math.cos(time * 27) * 0.4;
      campfireLight.intensity = flicker;
      campfireLight.position.y = 0.65 + Math.sin(time * 12) * 0.05;

      fireGroup.children.forEach((flame, idx) => {
        const offset = idx * 1.3;
        flame.scale.y = 0.8 + Math.sin(time * 10 + offset) * 0.35;
        flame.rotation.y += delta * (idx % 2 === 0 ? 1.5 : -1.5);
      });

      // Subtle water gentle wave
      waterMesh.position.y = -0.15 + Math.sin(time * 1.5) * 0.04;
    },
  };
}

/**
 * Builds procedural low-poly Pine and Deciduous trees around the world.
 */
function buildFoliage(scene: THREE.Scene) {
  const treePositions: { x: number; z: number; type: 'pine' | 'leaf' | 'rock' }[] = [];

  // Seeded distribution keeping a wide open 15m radius clearing for the campfire plaza
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15.5 + Math.random() * 35;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Strict clearance around central spawn plaza
    if (Math.hypot(x, z) < 15.0) continue;

    // Avoid lake
    const lakeDist = Math.hypot(x - 18, z + 12);
    if (lakeDist < 11.5) continue;

    const rand = Math.random();
    const type = rand < 0.55 ? 'pine' : rand < 0.85 ? 'leaf' : 'rock';
    treePositions.push({ x, z, type });
  }

  const pineTrunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.8, 6);
  const pineTrunkMat = new THREE.MeshStandardMaterial({
    color: '#422006',
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
  });

  const pineFoliageMat1 = new THREE.MeshStandardMaterial({
    color: '#166534',
    roughness: 0.75,
    metalness: 0.05,
    flatShading: true,
  });
  const pineFoliageMat2 = new THREE.MeshStandardMaterial({
    color: '#15803d',
    roughness: 0.75,
    metalness: 0.05,
    flatShading: true,
  });

  const leafTrunkMat = new THREE.MeshStandardMaterial({
    color: '#573016',
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  const leafCanopyMat = new THREE.MeshStandardMaterial({
    color: '#65a30d',
    roughness: 0.7,
    metalness: 0.05,
    flatShading: true,
  });

  const rockMat = new THREE.MeshStandardMaterial({
    color: '#71717a',
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });

  treePositions.forEach(({ x, z, type }) => {
    const y = getTerrainHeight(x, z);

    if (type === 'pine') {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, y, z);
      const s = 0.8 + Math.random() * 0.5;
      treeGroup.scale.set(s, s, s);

      // Trunk
      const trunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      // 3 Conical foliage layers
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.0, 6), pineFoliageMat1);
      cone1.position.y = 2.0;
      cone1.castShadow = true;
      treeGroup.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 6), pineFoliageMat2);
      cone2.position.y = 2.9;
      cone2.castShadow = true;
      treeGroup.add(cone2);

      const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 6), pineFoliageMat1);
      cone3.position.y = 3.8;
      cone3.castShadow = true;
      treeGroup.add(cone3);

      scene.add(treeGroup);
    } else if (type === 'leaf') {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, y, z);
      const s = 0.85 + Math.random() * 0.45;
      treeGroup.scale.set(s, s, s);

      // Curved organic trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.2, 6), leafTrunkMat);
      trunk.position.y = 1.1;
      trunk.rotation.z = (Math.random() - 0.5) * 0.15;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Main leafy canopy (faceted Icosahedron)
      const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), leafCanopyMat);
      canopy.position.y = 2.8;
      canopy.castShadow = true;
      treeGroup.add(canopy);

      const canopySub = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), leafCanopyMat);
      canopySub.position.set(0.6, 3.2, 0.4);
      canopySub.castShadow = true;
      treeGroup.add(canopySub);

      scene.add(treeGroup);
    } else {
      // Natural scattered boulder
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.7, 0), rockMat);
      rock.position.set(x, y + 0.3, z);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.scale.set(1 + Math.random() * 0.4, 0.7 + Math.random() * 0.4, 1 + Math.random() * 0.3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }
  });
}
