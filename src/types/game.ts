export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type HairStyle = 'casual' | 'explorer_hat' | 'animal_ears' | 'beanie' | 'crown' | 'headphones';
export type OutfitStyle = 'explorer' | 'hoodie' | 'adventurer' | 'nature_guardian';
export type BackAccessory = 'backpack' | 'leaf_wings' | 'lantern' | 'camp_roll' | 'none';
export type FaceStyle = 'smile' | 'wink' | 'cool_glasses' | 'sparkle';
export type CharacterEmote = 'none' | 'wave' | 'dance' | 'salute' | 'cheer' | 'clap' | 'sit';

export interface CharacterAppearance {
  shirtColor: string;
  pantsColor?: string;
  skinColor?: string;
  hairColor?: string;
  hairStyle?: HairStyle;
  outfit?: OutfitStyle;
  accessory?: BackAccessory;
  faceStyle?: FaceStyle;
}

export interface PlayerData {
  id: string;
  nickname: string;
  color: string;
  appearance?: CharacterAppearance;
  emote?: CharacterEmote;
  position: Vector3D;
  rotationY: number;
  isMoving: boolean;
  isJumping: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  color: string;
  text: string;
  timestamp: number;
}

export interface WorldConfig {
  gravity: number;
  walkSpeed: number;
  runSpeed: number;
  jumpVelocity: number;
  worldRadius: number;
}

export type CameraPreset = 'close' | 'normal' | 'far' | 'top';
