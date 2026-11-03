import * as THREE from 'three';
import {
  BackAccessory,
  CharacterAppearance,
  CharacterEmote,
  FaceStyle,
  HairStyle,
  OutfitStyle,
} from '../types/game.ts';

export interface CharacterRig {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  accessoryGroup?: THREE.Group;
  wingsMesh?: THREE.Group;
  animTime: number;
  emoteTime: number;
  currentEmote: CharacterEmote;
  appearance: CharacterAppearance;
  nameplateSprite?: THREE.Sprite;
  speechBubbleSprite?: THREE.Sprite;
  speechBubbleTimer?: number;
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  shirtColor: '#3b82f6',
  pantsColor: '#1e293b',
  skinColor: '#fcd34d',
  hairColor: '#332219',
  hairStyle: 'casual',
  outfit: 'explorer',
  accessory: 'backpack',
  faceStyle: 'smile',
};

export interface CharacterPreset {
  id: string;
  name: string;
  desc: string;
  icon: string;
  appearance: CharacterAppearance;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'explorer',
    name: '베테랑 탐험가',
    desc: '사파리 탐험 모자와 튼튼한 다기능 배낭을 맨 전문 모험가',
    icon: '🧭',
    appearance: {
      shirtColor: '#f59e0b',
      pantsColor: '#334155',
      skinColor: '#fcd34d',
      hairColor: '#451a03',
      hairStyle: 'explorer_hat',
      outfit: 'explorer',
      accessory: 'backpack',
      faceStyle: 'smile',
    },
  },
  {
    id: 'nature_guardian',
    name: '자연의 수호자',
    desc: '신비로운 나뭇잎 날개와 은은한 화관을 쓴 숲의 수호자',
    icon: '🌿',
    appearance: {
      shirtColor: '#10b981',
      pantsColor: '#064e3b',
      skinColor: '#fef08a',
      hairColor: '#065f46',
      hairStyle: 'crown',
      outfit: 'nature_guardian',
      accessory: 'leaf_wings',
      faceStyle: 'sparkle',
    },
  },
  {
    id: 'cute_adventurer',
    name: '꼬마 모험가',
    desc: '귀여운 동물 귀 모자와 편안한 후드티를 입은 활발한 친구',
    icon: '🐱',
    appearance: {
      shirtColor: '#f43f5e',
      pantsColor: '#1e293b',
      skinColor: '#fed7aa',
      hairColor: '#78350f',
      hairStyle: 'animal_ears',
      outfit: 'hoodie',
      accessory: 'camp_roll',
      faceStyle: 'wink',
    },
  },
  {
    id: 'cool_traveler',
    name: '자유로운 여행자',
    desc: '트렌디한 헤드폰과 멋진 선글라스를 착용한 방랑자',
    icon: '🎧',
    appearance: {
      shirtColor: '#8b5cf6',
      pantsColor: '#0f172a',
      skinColor: '#fcd34d',
      hairColor: '#1e1b4b',
      hairStyle: 'headphones',
      outfit: 'adventurer',
      accessory: 'lantern',
      faceStyle: 'cool_glasses',
    },
  },
  {
    id: 'cozy_camper',
    name: '아늑한 캠퍼',
    desc: '따뜻한 비니와 밤길을 비추는 캠핑 랜턴을 든 캠퍼',
    icon: '⛺',
    appearance: {
      shirtColor: '#0284c7',
      pantsColor: '#334155',
      skinColor: '#fef3c7',
      hairColor: '#292524',
      hairStyle: 'beanie',
      outfit: 'hoodie',
      accessory: 'lantern',
      faceStyle: 'smile',
    },
  },
];

/**
 * Creates a stylish procedural low-poly humanoid character.
 * Supports complete appearance customization and emote animations.
 */
export function createCharacter(param: CharacterAppearance | string = DEFAULT_APPEARANCE): CharacterRig {
  const appearance: CharacterAppearance =
    typeof param === 'string'
      ? { ...DEFAULT_APPEARANCE, shirtColor: param }
      : { ...DEFAULT_APPEARANCE, ...param };

  const root = new THREE.Group();
  root.name = 'CharacterRoot';

  // Extract appearance values with safe fallbacks
  const shirtHex = appearance.shirtColor || DEFAULT_APPEARANCE.shirtColor;
  const pantsHex = appearance.pantsColor || DEFAULT_APPEARANCE.pantsColor || '#1e293b';
  const skinHex = appearance.skinColor || DEFAULT_APPEARANCE.skinColor || '#fcd34d';
  const hairHex = appearance.hairColor || DEFAULT_APPEARANCE.hairColor || '#332219';
  const hairStyle: HairStyle = appearance.hairStyle || 'casual';
  const outfit: OutfitStyle = appearance.outfit || 'explorer';
  const accessory: BackAccessory = appearance.accessory || 'backpack';
  const faceStyle: FaceStyle = appearance.faceStyle || 'smile';

  // Base Materials
  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shirtHex),
    roughness: 0.6,
    metalness: 0.1,
    flatShading: true,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinHex),
    roughness: 0.75,
    metalness: 0.05,
    flatShading: true,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(pantsHex),
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.2,
    flatShading: true,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairHex),
    roughness: 0.8,
    metalness: 0.0,
    flatShading: true,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.2,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.85,
    flatShading: true,
  });

  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xf472b6,
  });

  // 1. Pelvis / Hips (Y: 0.85)
  const pelvisGeo = new THREE.BoxGeometry(0.36, 0.16, 0.24);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
  pelvisMesh.position.y = 0.85;
  pelvisMesh.castShadow = true;
  root.add(pelvisMesh);

  // Belt & Buckle
  const beltGeo = new THREE.BoxGeometry(0.37, 0.06, 0.25);
  const beltMesh = new THREE.Mesh(beltGeo, shoeMat);
  beltMesh.position.y = 0.92;
  root.add(beltMesh);

  const buckleGeo = new THREE.BoxGeometry(0.08, 0.06, 0.04);
  const buckleMesh = new THREE.Mesh(buckleGeo, goldMat);
  buckleMesh.position.set(0, 0.92, 0.13);
  root.add(buckleMesh);

  // 2. Torso Group (Y: 0.94)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.94, 0);

  // Upper Torso Chest
  const chestGeo = new THREE.BoxGeometry(0.42, 0.46, 0.26);
  const chestMesh = new THREE.Mesh(chestGeo, shirtMat);
  chestMesh.position.y = 0.23;
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torsoGroup.add(chestMesh);

  // Outfit specific details
  if (outfit === 'explorer') {
    // Two utility chest pockets
    const pocketGeo = new THREE.BoxGeometry(0.12, 0.12, 0.03);
    const pocketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtHex).clone().multiplyScalar(0.85),
      roughness: 0.7,
      flatShading: true,
    });
    const leftPocket = new THREE.Mesh(pocketGeo, pocketMat);
    leftPocket.position.set(-0.1, 0.25, 0.14);
    torsoGroup.add(leftPocket);

    const rightPocket = new THREE.Mesh(pocketGeo, pocketMat);
    rightPocket.position.set(0.1, 0.25, 0.14);
    torsoGroup.add(rightPocket);

    // Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.22), pocketMat);
    collar.position.set(0, 0.47, 0);
    torsoGroup.add(collar);
  } else if (outfit === 'hoodie') {
    // Kangaroo front pouch
    const pouchGeo = new THREE.BoxGeometry(0.28, 0.14, 0.05);
    const pouchMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtHex).clone().multiplyScalar(0.9),
      roughness: 0.8,
      flatShading: true,
    });
    const pouch = new THREE.Mesh(pouchGeo, pouchMat);
    pouch.position.set(0, 0.14, 0.15);
    torsoGroup.add(pouch);

    // Hood trim behind neck
    const hoodTrim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.12), pouchMat);
    hoodTrim.position.set(0, 0.45, -0.12);
    torsoGroup.add(hoodTrim);
  } else if (outfit === 'adventurer') {
    // Diagonal leather sash strap
    const sashGeo = new THREE.BoxGeometry(0.44, 0.08, 0.28);
    const sash = new THREE.Mesh(sashGeo, shoeMat);
    sash.rotation.z = 0.45;
    sash.position.set(0, 0.23, 0.02);
    torsoGroup.add(sash);

    // Golden badge brooch
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), goldMat);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0.1, 0.32, 0.15);
    torsoGroup.add(badge);
  } else if (outfit === 'nature_guardian') {
    // Leaf chest inlay
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.4,
      flatShading: true,
    });
    const leafEmblem = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), leafMat);
    leafEmblem.rotation.x = Math.PI / 2;
    leafEmblem.position.set(0, 0.26, 0.14);
    torsoGroup.add(leafEmblem);

    // Leaf shoulder pauldrons
    const leftPad = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.2), leafMat);
    leftPad.position.set(-0.25, 0.43, 0);
    leftPad.rotation.z = 0.2;
    torsoGroup.add(leftPad);

    const rightPad = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.2), leafMat);
    rightPad.position.set(0.25, 0.43, 0);
    rightPad.rotation.z = -0.2;
    torsoGroup.add(rightPad);
  }

  // 3. Back Accessory Group
  const accessoryGroup = new THREE.Group();
  let wingsMesh: THREE.Group | undefined;

  if (accessory === 'backpack') {
    const packMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.7,
      metalness: 0.15,
      flatShading: true,
    });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.16), packMat);
    pack.position.set(0, 0.23, -0.19);
    pack.castShadow = true;
    accessoryGroup.add(pack);

    // Bedroll on top of backpack
    const roll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.36, 6),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8, flatShading: true })
    );
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 0.44, -0.18);
    accessoryGroup.add(roll);
  } else if (accessory === 'leaf_wings') {
    wingsMesh = new THREE.Group();
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // Left Wing
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), wingMat);
    leftWing.rotation.z = 1.1;
    leftWing.rotation.x = -0.2;
    leftWing.position.set(-0.28, 0.32, -0.18);
    wingsMesh.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), wingMat);
    rightWing.rotation.z = -1.1;
    rightWing.rotation.x = -0.2;
    rightWing.position.set(0.28, 0.32, -0.18);
    wingsMesh.add(rightWing);

    accessoryGroup.add(wingsMesh);
  } else if (accessory === 'lantern') {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.22, 0.12, -0.16);

    const metalLanternMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });

    const topLantern = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.06, 6), metalLanternMat);
    topLantern.position.y = 0.12;
    lanternGroup.add(topLantern);

    const bodyLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 6), glassMat);
    bodyLantern.position.y = 0.03;
    lanternGroup.add(bodyLantern);

    const bottomLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), metalLanternMat);
    bottomLantern.position.y = -0.06;
    lanternGroup.add(bottomLantern);

    accessoryGroup.add(lanternGroup);
  } else if (accessory === 'camp_roll') {
    const campMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7, flatShading: true });
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.38, 7), campMat);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 0.28, -0.18);
    roll.castShadow = true;
    accessoryGroup.add(roll);

    // Wooden canteen
    const canteen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 })
    );
    canteen.rotation.x = Math.PI / 2;
    canteen.position.set(-0.16, 0.12, -0.16);
    accessoryGroup.add(canteen);
  }

  torsoGroup.add(accessoryGroup);

  // 4. Head Group (Neck pivot at Y: 0.48 on torsoGroup)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.48, 0);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.1, 6);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 0.05;
  headGroup.add(neckMesh);

  // Head mesh
  const headGeo = new THREE.BoxGeometry(0.32, 0.32, 0.3);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 0.24;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Face Eyes & Expression
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });

  if (faceStyle === 'smile' || faceStyle === 'sparkle') {
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.03), eyeMat);
    leftEye.position.set(-0.08, 0.24, 0.155);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.03), eyeMat);
    rightEye.position.set(0.08, 0.24, 0.155);
    headGroup.add(rightEye);

    // Cheek blush
    const leftBlush = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.01), blushMat);
    leftBlush.position.set(-0.1, 0.18, 0.155);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.01), blushMat);
    rightBlush.position.set(0.1, 0.18, 0.155);
    headGroup.add(rightBlush);

    if (faceStyle === 'sparkle') {
      const sparkleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const leftStar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), sparkleMat);
      leftStar.position.set(-0.08, 0.26, 0.165);
      headGroup.add(leftStar);

      const rightStar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), sparkleMat);
      rightStar.position.set(0.08, 0.26, 0.165);
      headGroup.add(rightStar);
    }
  } else if (faceStyle === 'wink') {
    // Open left eye
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.03), eyeMat);
    leftEye.position.set(-0.08, 0.24, 0.155);
    headGroup.add(leftEye);

    // Winking right eye (horizontal slit)
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), eyeMat);
    rightEye.position.set(0.08, 0.24, 0.155);
    headGroup.add(rightEye);

    // Blush
    const leftBlush = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.01), blushMat);
    leftBlush.position.set(-0.1, 0.18, 0.155);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.01), blushMat);
    rightBlush.position.set(0.1, 0.18, 0.155);
    headGroup.add(rightBlush);
  } else if (faceStyle === 'cool_glasses') {
    // Shaded adventure sunglasses
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.1,
      metalness: 0.9,
    });
    const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.04), glassesMat);
    leftLens.position.set(-0.08, 0.24, 0.16);
    headGroup.add(leftLens);

    const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.04), glassesMat);
    rightLens.position.set(0.08, 0.24, 0.16);
    headGroup.add(rightLens);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.03), goldMat);
    bridge.position.set(0, 0.25, 0.16);
    headGroup.add(bridge);
  }

  // Headgear / Hair Styles
  if (hairStyle === 'casual') {
    // Base hair
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.35), hairMat);
    hairMesh.position.set(0, 0.35, -0.02);
    hairMesh.castShadow = true;
    headGroup.add(hairMesh);

    // Front bangs
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.1), hairMat);
    bangs.position.set(0, 0.32, 0.14);
    headGroup.add(bangs);

    // Side tufts
    const leftTuft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.2), hairMat);
    leftTuft.position.set(-0.17, 0.28, 0.04);
    headGroup.add(leftTuft);

    const rightTuft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.2), hairMat);
    rightTuft.position.set(0.17, 0.28, 0.04);
    headGroup.add(rightTuft);
  } else if (hairStyle === 'explorer_hat') {
    const hatColor = 0xd97706; // Safari amber/khaki
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.65, flatShading: true });

    // Under-hat hair fringe
    const hairFringe = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.06, 0.1), hairMat);
    hairFringe.position.set(0, 0.3, 0.13);
    headGroup.add(hairFringe);

    // Wide brim
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 10), hatMat);
    brim.position.set(0, 0.35, 0);
    brim.castShadow = true;
    headGroup.add(brim);

    // Hat crown
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.16, 10), hatMat);
    crown.position.set(0, 0.44, 0);
    crown.castShadow = true;
    headGroup.add(crown);

    // Leather band & buckle
    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.232, 0.235, 0.05, 10), darkMat);
    hatBand.position.set(0, 0.39, 0);
    headGroup.add(hatBand);

    const hatBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), goldMat);
    hatBuckle.position.set(0, 0.39, 0.235);
    headGroup.add(hatBuckle);
  } else if (hairStyle === 'animal_ears') {
    const capMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, flatShading: true });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });

    // Cap
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.34), capMat);
    cap.position.set(0, 0.35, 0);
    cap.castShadow = true;
    headGroup.add(cap);

    // Bangs peaking through
    const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.06, 0.08), hairMat);
    hairBangs.position.set(0, 0.28, 0.15);
    headGroup.add(hairBangs);

    // Left Cat/Bear Ear
    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.15, 4), capMat);
    leftEar.rotation.z = 0.25;
    leftEar.rotation.y = Math.PI / 4;
    leftEar.position.set(-0.14, 0.48, 0.04);
    headGroup.add(leftEar);

    const leftInner = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), innerEarMat);
    leftInner.rotation.z = 0.25;
    leftInner.position.set(-0.13, 0.47, 0.07);
    headGroup.add(leftInner);

    // Right Ear
    const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.15, 4), capMat);
    rightEar.rotation.z = -0.25;
    rightEar.rotation.y = Math.PI / 4;
    rightEar.position.set(0.14, 0.48, 0.04);
    headGroup.add(rightEar);

    const rightInner = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), innerEarMat);
    rightInner.rotation.z = -0.25;
    rightInner.position.set(0.13, 0.47, 0.07);
    headGroup.add(rightInner);
  } else if (hairStyle === 'beanie') {
    const beanieMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtHex).clone().multiplyScalar(0.8),
      roughness: 0.9,
      flatShading: true,
    });
    const beanieDarkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtHex).clone().multiplyScalar(0.68),
      roughness: 0.9,
      flatShading: true,
    });
    const patchMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.7,
      flatShading: true,
    });

    // Hair fringe & side tufts peaking out from under the beanie
    const hairFringe = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.07, 0.09), hairMat);
    hairFringe.position.set(0, 0.28, 0.14);
    headGroup.add(hairFringe);

    const leftTuft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.18), hairMat);
    leftTuft.position.set(-0.17, 0.26, 0.02);
    headGroup.add(leftTuft);

    const rightTuft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.18), hairMat);
    rightTuft.position.set(0.17, 0.26, 0.02);
    headGroup.add(rightTuft);

    // 1. Folded square rim cuff (사각 롤업 밑단)
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.34), beanieDarkMat);
    rim.position.set(0, 0.35, -0.01);
    rim.castShadow = true;
    headGroup.add(rim);

    // Woven street/outdoor tag patch on rim front-left
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.05, 0.012), patchMat);
    tag.position.set(-0.1, 0.35, 0.162);
    headGroup.add(tag);

    // 2. Square Beanie Main Crown (사각 본체)
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.32), beanieMat);
    crown.position.set(0, 0.44, -0.015);
    crown.castShadow = true;
    headGroup.add(crown);

    // 3. Square Beanie Top Layer (상단 사각 마감)
    const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.08, 0.28), beanieMat);
    topCap.position.set(0, 0.53, -0.02);
    topCap.castShadow = true;
    headGroup.add(topCap);

    // 4. Low-Poly Cube Pom Pom (다이아몬드 회전 사각 폼폼)
    const pomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
    const pom = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.085, 0.085), pomMat);
    pom.rotation.y = Math.PI / 4;
    pom.position.set(0, 0.60, -0.02);
    pom.castShadow = true;
    headGroup.add(pom);
  } else if (hairStyle === 'crown') {
    // Hair base
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.35), hairMat);
    hairMesh.position.set(0, 0.34, -0.02);
    headGroup.add(hairMesh);

    // Nature leaf & flower garland
    const garlandMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, flatShading: true });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });

    const garland = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.035, 6, 12), garlandMat);
    garland.rotation.x = Math.PI / 2;
    garland.position.set(0, 0.38, 0);
    headGroup.add(garland);

    // Little flowers around garland
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2.5) {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 5), flowerMat);
      fl.position.set(Math.cos(angle) * 0.19, 0.4, Math.sin(angle) * 0.19);
      headGroup.add(fl);
    }
  } else if (hairStyle === 'headphones') {
    // Hair base
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.35), hairMat);
    hairMesh.position.set(0, 0.35, -0.02);
    headGroup.add(hairMesh);

    const hpMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.8 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

    // Arch headband
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 6, 12, Math.PI), hpMat);
    arch.rotation.z = Math.PI;
    arch.position.set(0, 0.38, 0);
    headGroup.add(arch);

    // Left earcup
    const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 8), hpMat);
    leftCup.rotation.z = Math.PI / 2;
    leftCup.position.set(-0.19, 0.26, 0);
    headGroup.add(leftCup);

    const leftCushion = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), cushionMat);
    leftCushion.rotation.z = Math.PI / 2;
    leftCushion.position.set(-0.16, 0.26, 0);
    headGroup.add(leftCushion);

    // Right earcup
    const rightCup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 8), hpMat);
    rightCup.rotation.z = Math.PI / 2;
    rightCup.position.set(0.19, 0.26, 0);
    headGroup.add(rightCup);

    const rightCushion = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), cushionMat);
    rightCushion.rotation.z = Math.PI / 2;
    rightCushion.position.set(0.16, 0.26, 0);
    headGroup.add(rightCushion);
  }

  torsoGroup.add(headGroup);
  root.add(torsoGroup);

  // 5. Left Arm (Shoulder pivot at X: -0.27, Y: 0.4)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.27, 0.4, 0);

  const sleeveGeo = new THREE.BoxGeometry(0.12, 0.22, 0.14);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.y = -0.11;
  leftSleeve.castShadow = true;
  leftArm.add(leftSleeve);

  const armGeo = new THREE.BoxGeometry(0.1, 0.22, 0.12);
  const leftForearm = new THREE.Mesh(armGeo, skinMat);
  leftForearm.position.y = -0.3;
  leftForearm.castShadow = true;
  leftArm.add(leftForearm);

  torsoGroup.add(leftArm);

  // 6. Right Arm (Shoulder pivot at X: 0.27, Y: 0.4)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.27, 0.4, 0);

  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.y = -0.11;
  rightSleeve.castShadow = true;
  rightArm.add(rightSleeve);

  const rightForearm = new THREE.Mesh(armGeo, skinMat);
  rightForearm.position.y = -0.3;
  rightForearm.castShadow = true;
  rightArm.add(rightForearm);

  torsoGroup.add(rightArm);

  // 7. Left Leg (Hip pivot at X: -0.11, Y: 0.8)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.8, 0);

  const legGeo = new THREE.BoxGeometry(0.15, 0.46, 0.16);
  const leftPants = new THREE.Mesh(legGeo, pantsMat);
  leftPants.position.y = -0.23;
  leftPants.castShadow = true;
  leftLeg.add(leftPants);

  const shoeGeo = new THREE.BoxGeometry(0.16, 0.14, 0.24);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.44, 0.03);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);

  root.add(leftLeg);

  // 8. Right Leg (Hip pivot at X: 0.11, Y: 0.8)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.8, 0);

  const rightPants = new THREE.Mesh(legGeo, pantsMat);
  rightPants.position.y = -0.23;
  rightPants.castShadow = true;
  rightLeg.add(rightPants);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.44, 0.03);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);

  root.add(rightLeg);

  return {
    root,
    torsoGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    accessoryGroup,
    wingsMesh,
    animTime: 0,
    emoteTime: 0,
    currentEmote: 'none',
    appearance,
  };
}

/**
 * Procedural animation update for walking, jumping, idle, and full emotes.
 */
export function animateCharacterRig(
  rig: CharacterRig,
  delta: number,
  isMoving: boolean,
  isJumping: boolean
) {
  if (isMoving) {
    rig.animTime += delta * 11;
    // Moving interrupts any sitting or emote
    if (rig.currentEmote !== 'none') {
      rig.currentEmote = 'none';
      rig.emoteTime = 0;
    }
  } else if (rig.currentEmote !== 'none') {
    rig.emoteTime += delta;
    rig.animTime += delta * 2;
  } else {
    rig.animTime += delta * 2;
  }

  const t = rig.animTime;
  const et = rig.emoteTime;

  // Flutter leaf wings gently if present
  if (rig.wingsMesh) {
    const wingFlap = Math.sin(t * (isMoving ? 14 : 5)) * 0.2;
    rig.wingsMesh.children[0].rotation.y = wingFlap;
    rig.wingsMesh.children[1].rotation.y = -wingFlap;
  }

  if (isJumping) {
    // Jump pose: arms raise slightly, legs bend back
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.8, 12, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.8, 12, delta);
    rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, 0, 12, delta);
    rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, 0, 12, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, -0.3, 12, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0.3, 12, delta);

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0.4, 12, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0.3, 12, delta);
    rig.torsoGroup.position.y = THREE.MathUtils.damp(rig.torsoGroup.position.y, 0.98, 12, delta);
    rig.torsoGroup.rotation.y = THREE.MathUtils.damp(rig.torsoGroup.rotation.y, 0, 12, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 12, delta);
  } else if (isMoving) {
    // Reset any emote transforms
    rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, 0, 12, delta);
    rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, 0, 12, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 12, delta);

    // Walk / Run cycle: pendulum arm and leg swings
    const swingArm = Math.sin(t) * 0.75;
    const swingLeg = Math.sin(t) * 0.7;

    rig.leftArm.rotation.x = swingArm;
    rig.rightArm.rotation.x = -swingArm;
    rig.leftArm.rotation.z = 0;
    rig.rightArm.rotation.z = 0;

    rig.leftLeg.rotation.x = -swingLeg;
    rig.rightLeg.rotation.x = swingLeg;

    // Torso bounce
    const bounce = Math.abs(Math.sin(t)) * 0.06;
    rig.torsoGroup.position.y = 0.94 + bounce;
    rig.torsoGroup.rotation.y = Math.sin(t * 0.5) * 0.08;
    rig.headGroup.rotation.x = Math.sin(t) * 0.04;
  } else if (rig.currentEmote === 'wave') {
    // Wave greeting: right arm raised up beside head, waving side-to-side towards friends
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.15 + Math.cos(et * 9) * 0.05, 10, delta);
    rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, -0.65, 10, delta);
    rig.rightArm.rotation.z = 2.65 + Math.sin(et * 9) * 0.28;

    // Left arm relaxed naturally by hip
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0.05, 8, delta);
    rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, 0, 8, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.1, 8, delta);

    // Friendly tilted head and slight torso bounce
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, -0.12, 8, delta);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, 0.04, 8, delta);
    rig.torsoGroup.position.y = 0.94 + Math.sin(et * 4) * 0.015;

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, delta);
  } else if (rig.currentEmote === 'dance') {
    // Rhythmic playful dance: hops and alternating arm pumps
    const danceBeat = et * 7;
    const hop = Math.abs(Math.sin(danceBeat)) * 0.1;
    rig.torsoGroup.position.y = 0.94 + hop;
    rig.torsoGroup.rotation.y = Math.sin(danceBeat * 0.5) * 0.28;

    rig.leftArm.rotation.x = Math.sin(danceBeat) * 0.7 - 0.3;
    rig.rightArm.rotation.x = -Math.sin(danceBeat) * 0.7 - 0.3;
    rig.leftArm.rotation.z = 0.3 + Math.cos(danceBeat) * 0.2;
    rig.rightArm.rotation.z = -0.3 - Math.cos(danceBeat) * 0.2;

    rig.leftLeg.rotation.x = -Math.sin(danceBeat) * 0.4;
    rig.rightLeg.rotation.x = Math.sin(danceBeat) * 0.4;
    rig.headGroup.rotation.z = Math.sin(danceBeat * 0.5) * 0.18;
  } else if (rig.currentEmote === 'salute') {
    // Sharp, dignified explorer salute: right hand snaps smartly to brow/temple
    const targetRx = 0.0;
    const targetRy = -1.4;
    const targetRz = 2.7;

    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRx, 16, delta);
    rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, targetRy, 16, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRz, 16, delta);

    // Left arm straight at side, pinned smartly
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 10, delta);
    rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, 0, 10, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.05, 10, delta);

    // Confident upright posture: chest tall, head held high
    rig.torsoGroup.position.y = THREE.MathUtils.damp(rig.torsoGroup.position.y, 0.955, 8, delta);
    rig.torsoGroup.rotation.x = THREE.MathUtils.damp(rig.torsoGroup.rotation.x, -0.04, 8, delta);
    rig.torsoGroup.rotation.y = THREE.MathUtils.damp(rig.torsoGroup.rotation.y, 0, 8, delta);

    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, -0.05, 8, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 8, delta);

    // Standing straight
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, delta);
  } else if (rig.currentEmote === 'sit') {
    // Backwards-compatible alias for any legacy emote triggers
    rig.currentEmote = 'salute';
  } else if (rig.currentEmote === 'cheer') {
    // Triumphant dual-arm raise with little bounces
    const cheerBeat = et * 8;
    rig.torsoGroup.position.y = 0.94 + Math.abs(Math.sin(cheerBeat)) * 0.08;

    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, -0.5, 10, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, -0.5, 10, delta);
    rig.leftArm.rotation.z = -2.1 + Math.sin(cheerBeat) * 0.15;
    rig.rightArm.rotation.z = 2.1 - Math.sin(cheerBeat) * 0.15;

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, delta);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, -0.2, 8, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 8, delta);
  } else if (rig.currentEmote === 'clap') {
    // Crisp rhythmic clapping hands in front of chest
    const clapCycle = Math.sin(et * 9.5);
    const clapOpen = Math.pow(Math.abs(clapCycle), 0.75); // 0 = clap impact, 1 = open
    const clapAngle = 0.62 - clapOpen * 0.38;

    rig.leftArm.rotation.x = -1.25 + (1 - clapOpen) * 0.04;
    rig.rightArm.rotation.x = -1.25 + (1 - clapOpen) * 0.04;
    rig.leftArm.rotation.y = 0.08;
    rig.rightArm.rotation.y = -0.08;
    rig.leftArm.rotation.z = clapAngle;
    rig.rightArm.rotation.z = -clapAngle;

    // Torso subtle upbeat bounce on clap contact
    rig.torsoGroup.position.y = 0.94 + (1 - clapOpen) * 0.02;

    // Head slightly nods with rhythm
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, 0.08 - (1 - clapOpen) * 0.06, 12, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 8, delta);

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, delta);
  } else {
    // Idle pose with subtle breathing
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 8, delta);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0, 8, delta);
    rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, 0, 8, delta);
    rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, 0, 8, delta);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.05, 8, delta);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, -0.05, 8, delta);

    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, delta);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, delta);

    const breath = Math.sin(t) * 0.015;
    rig.torsoGroup.position.y = THREE.MathUtils.damp(rig.torsoGroup.position.y, 0.94 + breath, 5, delta);
    rig.torsoGroup.rotation.y = THREE.MathUtils.damp(rig.torsoGroup.rotation.y, 0, 8, delta);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, 0, 8, delta);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 8, delta);
  }
}
