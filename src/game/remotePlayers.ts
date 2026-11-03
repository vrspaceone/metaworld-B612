import * as THREE from 'three';
import { CharacterAppearance, CharacterEmote, PlayerData, Vector3D } from '../types/game.ts';
import { CharacterRig, animateCharacterRig, createCharacter } from './character.ts';
import { createNameplateSprite, createSpeechBubbleSprite } from './nameplate.ts';

export interface RemotePlayerInstance {
  data: PlayerData;
  rig: CharacterRig;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentRotY: number;
  targetRotY: number;
  isMoving: boolean;
  isJumping: boolean;
}

export class RemotePlayersManager {
  private scene: THREE.Scene;
  public players = new Map<string, RemotePlayerInstance>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public addPlayer(player: PlayerData) {
    if (this.players.has(player.id)) {
      this.removePlayer(player.id);
    }

    const rig = createCharacter(player.appearance || player.color);
    rig.root.position.set(player.position.x, player.position.y, player.position.z);
    rig.root.rotation.y = player.rotationY;
    if (player.emote) {
      rig.currentEmote = player.emote;
    }

    // Attach native 3D Billboard Nameplate directly to character
    const nameplate = createNameplateSprite(player.nickname, player.color, false);
    rig.nameplateSprite = nameplate;
    rig.root.add(nameplate);

    this.scene.add(rig.root);

    const instance: RemotePlayerInstance = {
      data: player,
      rig,
      currentPos: new THREE.Vector3(player.position.x, player.position.y, player.position.z),
      targetPos: new THREE.Vector3(player.position.x, player.position.y, player.position.z),
      currentRotY: player.rotationY,
      targetRotY: player.rotationY,
      isMoving: player.isMoving,
      isJumping: player.isJumping,
    };

    this.players.set(player.id, instance);
  }

  public updatePlayerTransform(
    id: string,
    pos: Vector3D,
    rotY: number,
    isMoving: boolean,
    isJumping: boolean,
    emote?: CharacterEmote
  ) {
    const instance = this.players.get(id);
    if (!instance) return;

    instance.targetPos.set(pos.x, pos.y, pos.z);
    instance.targetRotY = rotY;
    instance.isMoving = isMoving;
    instance.isJumping = isJumping;
    if (emote !== undefined && emote !== instance.rig.currentEmote) {
      instance.rig.currentEmote = emote;
      instance.rig.emoteTime = 0;
      instance.data.emote = emote;
    }
  }

  public updatePlayerAppearance(id: string, appearance: CharacterAppearance) {
    const instance = this.players.get(id);
    if (!instance) return;

    const pos = instance.rig.root.position.clone();
    const rotY = instance.rig.root.rotation.y;
    const nameplate = instance.rig.nameplateSprite;
    const bubble = instance.rig.speechBubbleSprite;
    const bubbleTimer = instance.rig.speechBubbleTimer;

    if (nameplate) instance.rig.root.remove(nameplate);
    if (bubble) instance.rig.root.remove(bubble);

    this.scene.remove(instance.rig.root);

    // Dispose old meshes
    instance.rig.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    const newRig = createCharacter(appearance);
    newRig.root.position.copy(pos);
    newRig.root.rotation.y = rotY;
    newRig.currentEmote = instance.rig.currentEmote;
    newRig.emoteTime = instance.rig.emoteTime;

    if (nameplate) {
      newRig.nameplateSprite = nameplate;
      newRig.root.add(nameplate);
    }
    if (bubble) {
      newRig.speechBubbleSprite = bubble;
      newRig.speechBubbleTimer = bubbleTimer;
      newRig.root.add(bubble);
    }

    this.scene.add(newRig.root);
    instance.rig = newRig;
    instance.data.appearance = appearance;
    if (appearance.shirtColor) {
      instance.data.color = appearance.shirtColor;
    }
  }

  public setPlayerEmote(id: string, emote: CharacterEmote) {
    const instance = this.players.get(id);
    if (!instance) return;
    instance.rig.currentEmote = emote;
    instance.rig.emoteTime = 0;
    instance.data.emote = emote;
  }

  public setSpeechBubble(id: string, text: string) {
    const instance = this.players.get(id);
    if (!instance) return;

    // Remove existing bubble if any
    if (instance.rig.speechBubbleSprite) {
      instance.rig.root.remove(instance.rig.speechBubbleSprite);
      instance.rig.speechBubbleSprite.material.dispose();
      instance.rig.speechBubbleSprite = undefined;
    }

    // Attach fresh 3D speech bubble
    const bubble = createSpeechBubbleSprite(text);
    instance.rig.speechBubbleSprite = bubble;
    instance.rig.speechBubbleTimer = 5.0; // 5 seconds
    bubble.position.y = 2.45;
    instance.rig.root.add(bubble);
  }

  public removePlayer(id: string) {
    const instance = this.players.get(id);
    if (!instance) return;

    if (instance.rig.nameplateSprite) {
      instance.rig.root.remove(instance.rig.nameplateSprite);
      instance.rig.nameplateSprite.material.dispose();
    }
    if (instance.rig.speechBubbleSprite) {
      instance.rig.root.remove(instance.rig.speechBubbleSprite);
      instance.rig.speechBubbleSprite.material.dispose();
    }

    this.scene.remove(instance.rig.root);

    // Dispose meshes
    instance.rig.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    this.players.delete(id);
  }

  public update(delta: number) {
    this.players.forEach((instance) => {
      // Exponential position damping towards target
      instance.currentPos.x = THREE.MathUtils.damp(instance.currentPos.x, instance.targetPos.x, 14, delta);
      instance.currentPos.y = THREE.MathUtils.damp(instance.currentPos.y, instance.targetPos.y, 14, delta);
      instance.currentPos.z = THREE.MathUtils.damp(instance.currentPos.z, instance.targetPos.z, 14, delta);

      // Shortest angle interpolation for Y rotation
      let diff = (instance.targetRotY - instance.currentRotY) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      instance.currentRotY += diff * Math.min(1, delta * 12);

      instance.rig.root.position.copy(instance.currentPos);
      instance.rig.root.rotation.y = instance.currentRotY;

      // Animate character limbs
      animateCharacterRig(instance.rig, delta, instance.isMoving, instance.isJumping);

      // Update speech bubble timeout
      if (instance.rig.speechBubbleSprite && instance.rig.speechBubbleTimer !== undefined) {
        instance.rig.speechBubbleTimer -= delta;
        if (instance.rig.speechBubbleTimer <= 0) {
          instance.rig.root.remove(instance.rig.speechBubbleSprite);
          instance.rig.speechBubbleSprite.material.dispose();
          instance.rig.speechBubbleSprite = undefined;
        }
      }
    });
  }

  public clear() {
    this.players.forEach((_, id) => this.removePlayer(id));
  }
}
