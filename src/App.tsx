/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CameraPreset, CharacterAppearance, CharacterEmote, ChatMessage, PlayerData, Vector3D } from './types/game.ts';
import { soundEngine } from './game/audio.ts';
import {
  animateCharacterRig,
  CharacterRig,
  createCharacter,
  CHARACTER_PRESETS,
  DEFAULT_APPEARANCE,
} from './game/character.ts';
import { buildNatureWorld, getTerrainHeight, WorldEnvironment } from './game/world.ts';
import { ThirdPersonCamera } from './game/camera.ts';
import { networkManager } from './game/network.ts';
import { RemotePlayerInstance, RemotePlayersManager } from './game/remotePlayers.ts';
import { WorldEntryModal } from './components/WorldEntryModal.tsx';
import { ChatOverlay } from './components/ChatOverlay.tsx';
import { OnlinePlayersModal } from './components/OnlinePlayersModal.tsx';
import { ControlsHelpModal } from './components/ControlsHelpModal.tsx';
import { createNameplateSprite, createSpeechBubbleSprite } from './game/nameplate.ts';
import { ServerConfigModal } from './components/ServerConfigModal.tsx';
import { VirtualJoystick, TouchJumpButton } from './components/VirtualJoystick.tsx';
import { EmoteBar } from './components/EmoteBar.tsx';
import { CharacterCustomizerModal } from './components/CharacterCustomizerModal.tsx';
import { MobileQuickMenu } from './components/MobileQuickMenu.tsx';
import { Compass, Server, Users, Volume2, VolumeX, HelpCircle, Shirt, Video, MoreHorizontal, MessageSquare } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // User State
  const [hasEntered, setHasEntered] = useState(false);
  const hasEnteredRef = useRef(false);
  const [selfNickname, setSelfNickname] = useState('탐험가');
  const [selfColor, setSelfColor] = useState(CHARACTER_PRESETS[0].appearance.shirtColor);
  const [selfAppearance, setSelfAppearance] = useState<CharacterAppearance>(CHARACTER_PRESETS[0].appearance);
  const [currentEmote, setCurrentEmote] = useState<CharacterEmote>('none');
  const [selfId, setSelfId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Mobile drawers & menus
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const touchMoveRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // UI Modals & State
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('normal');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  // Game data state for 2D overlays
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerList, setPlayerList] = useState<PlayerData[]>([]);
  const [selfPosState, setSelfPosState] = useState<Vector3D>({ x: 0, y: 0, z: 5.5 });
  const [activeRemotePlayers, setActiveRemotePlayers] = useState<RemotePlayerInstance[]>([]);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  // Three.js References
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const tpCameraRef = useRef<ThirdPersonCamera | null>(null);
  const localRigRef = useRef<CharacterRig | null>(null);
  const remoteMgrRef = useRef<RemotePlayersManager | null>(null);
  const worldEnvRef = useRef<WorldEnvironment | null>(null);

  // Player Kinematics
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 5.5));
  const playerVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const playerRotYRef = useRef<number>(Math.PI);
  const isGroundedRef = useRef<boolean>(true);
  const isMovingRef = useRef<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);

  // Input Keys State (Keyboard)
  const keysRef = useRef<{
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
    space: boolean;
  }>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });

  // Mouse Orbit Dragging State
  const isMouseDownRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle entering the world
  const handleJoinWorld = (nickname: string, color: string, appearance: CharacterAppearance) => {
    hasEnteredRef.current = true;
    setSelfNickname(nickname);
    setSelfColor(color);
    setSelfAppearance(appearance);
    setHasEntered(true);

    // Initialize local character rig with chosen appearance and 3D overhead nameplate
    if (localRigRef.current) {
      const scene = localRigRef.current.root.parent as THREE.Scene | null;
      if (scene) {
        if (localRigRef.current.nameplateSprite) {
          localRigRef.current.root.remove(localRigRef.current.nameplateSprite);
          localRigRef.current.nameplateSprite.material.dispose();
        }
        if (localRigRef.current.speechBubbleSprite) {
          localRigRef.current.root.remove(localRigRef.current.speechBubbleSprite);
          localRigRef.current.speechBubbleSprite.material.dispose();
        }
        scene.remove(localRigRef.current.root);

        const newRig = createCharacter(appearance);
        newRig.root.position.copy(playerPosRef.current);
        newRig.root.rotation.y = playerRotYRef.current;
        const nameplate = createNameplateSprite(nickname, color, true);
        newRig.nameplateSprite = nameplate;
        newRig.root.add(nameplate);
        scene.add(newRig.root);
        localRigRef.current = newRig;
      }
    }

    // Connect and join via Socket.IO
    networkManager.joinWorld(nickname, color, appearance);
    soundEngine.startCampfireAmbience();
  };

  // Handle character wardrobe / appearance change during gameplay
  const handleApplyAppearance = (newAppearance: CharacterAppearance) => {
    setSelfAppearance(newAppearance);
    if (newAppearance.shirtColor) {
      setSelfColor(newAppearance.shirtColor);
    }

    if (localRigRef.current) {
      const scene = localRigRef.current.root.parent as THREE.Scene | null;
      if (scene) {
        const pos = playerPosRef.current.clone();
        const rotY = playerRotYRef.current;
        const nameplate = localRigRef.current.nameplateSprite;
        const bubble = localRigRef.current.speechBubbleSprite;
        const bubbleTimer = localRigRef.current.speechBubbleTimer;

        if (nameplate) localRigRef.current.root.remove(nameplate);
        if (bubble) localRigRef.current.root.remove(bubble);

        scene.remove(localRigRef.current.root);

        // Dispose previous meshes
        localRigRef.current.root.traverse((obj) => {
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

        const newRig = createCharacter(newAppearance);
        newRig.root.position.copy(pos);
        newRig.root.rotation.y = rotY;
        newRig.currentEmote = localRigRef.current.currentEmote;
        newRig.emoteTime = localRigRef.current.emoteTime;

        if (nameplate) {
          newRig.nameplateSprite = nameplate;
          newRig.root.add(nameplate);
        }
        if (bubble) {
          newRig.speechBubbleSprite = bubble;
          newRig.speechBubbleTimer = bubbleTimer;
          newRig.root.add(bubble);
        }

        scene.add(newRig.root);
        localRigRef.current = newRig;
      }
    }

    networkManager.sendAppearance(newAppearance);
  };

  // Handle trigger emote animation
  const triggerEmote = useCallback((emote: CharacterEmote) => {
    if (!localRigRef.current) return;
    const nextEmote = localRigRef.current.currentEmote === emote ? 'none' : emote;
    localRigRef.current.currentEmote = nextEmote;
    localRigRef.current.emoteTime = 0;
    setCurrentEmote(nextEmote);

    if (nextEmote !== 'none') {
      soundEngine.playEmoteSound(nextEmote);
    }
    networkManager.sendEmote(nextEmote);
  }, []);

  // Handle sending chat
  const handleSendMessage = useCallback((text: string) => {
    networkManager.sendChat(text);
    if (localRigRef.current) {
      if (localRigRef.current.speechBubbleSprite) {
        localRigRef.current.root.remove(localRigRef.current.speechBubbleSprite);
        localRigRef.current.speechBubbleSprite.material.dispose();
      }
      const bubble = createSpeechBubbleSprite(text);
      localRigRef.current.speechBubbleSprite = bubble;
      localRigRef.current.speechBubbleTimer = 5.0;
      localRigRef.current.root.add(bubble);
    }
    soundEngine.playChatChime();
  }, []);

  // Handle camera preset change
  const handleSelectPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    tpCameraRef.current?.setPreset(preset);
  };

  // Cycle camera preset for minimal mobile controls
  const handleCycleCameraPreset = () => {
    const presets: CameraPreset[] = ['close', 'normal', 'far', 'top'];
    const currentIndex = presets.indexOf(cameraPreset);
    const nextPreset = presets[(currentIndex + 1) % presets.length];
    handleSelectPreset(nextPreset);
  };

  // Handle audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Handle jump trigger for touch and key
  const triggerJump = useCallback(() => {
    if (isGroundedRef.current) {
      playerVelocityRef.current.y = 8.8; // Jump impulse
      isGroundedRef.current = false;
      isJumpingRef.current = true;
      if (localRigRef.current && localRigRef.current.currentEmote !== 'none') {
        localRigRef.current.currentEmote = 'none';
        setCurrentEmote('none');
      }
      soundEngine.playJump();
    }
  }, []);

  // Initialize Three.js Scene and Game Loop ONCE
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#bae6fd'); // Soft sky blue
    scene.fog = new THREE.FogExp2('#bae6fd', 0.016); // Horizon fog match

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    cameraRef.current = camera;

    // 3. Renderer with hardware/software conditional settings
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      precision: isSoftwareGl ? 'mediump' : 'highp',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Fast IBL Lighting via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    container.replaceChildren(renderer.domElement);

    // 4. Build Low-Poly Nature World
    const worldEnv = buildNatureWorld(scene);
    worldEnvRef.current = worldEnv;

    // 5. Build Local Player Character Rig
    const localRig = createCharacter(selfAppearance);
    localRig.root.position.copy(playerPosRef.current);
    const localNameplate = createNameplateSprite(selfNickname, selfColor, true);
    localRig.nameplateSprite = localNameplate;
    localRig.root.add(localNameplate);
    scene.add(localRig.root);
    localRigRef.current = localRig;

    // 6. Build Remote Players Manager
    const remoteMgr = new RemotePlayersManager(scene);
    remoteMgrRef.current = remoteMgr;

    // 7. Network Event Subscriptions
    networkManager.connect();
    networkManager.onConnectionChange((connected) => setIsConnected(connected));
    setIsConnected(networkManager.isConnected);

    networkManager.onWorldInit((data) => {
      setSelfId(data.selfId);
      setChatMessages(data.chatHistory || []);

      // Add existing remote players
      data.players.forEach((p) => {
        if (p.id !== data.selfId) {
          remoteMgr.addPlayer(p);
        }
      });
      setPlayerList(data.players);
      setActiveRemotePlayers(Array.from(remoteMgr.players.values()));
    });

    networkManager.onPlayerJoined((player) => {
      if (player.id !== networkManager.selfId) {
        remoteMgr.addPlayer(player);
        setPlayerList((prev) => [...prev.filter((p) => p.id !== player.id), player]);
        setActiveRemotePlayers(Array.from(remoteMgr.players.values()));
      }
    });

    networkManager.onPlayerMoved((data) => {
      remoteMgr.updatePlayerTransform(
        data.id,
        data.position,
        data.rotationY,
        data.isMoving,
        data.isJumping,
        data.emote
      );
    });

    networkManager.onPlayerAppearanceUpdated((data) => {
      remoteMgr.updatePlayerAppearance(data.id, data.appearance);
      setPlayerList((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, appearance: data.appearance, color: data.color } : p))
      );
    });

    networkManager.onPlayerEmoted((data) => {
      remoteMgr.setPlayerEmote(data.id, data.emote);
    });

    networkManager.onPlayerLeft((data) => {
      remoteMgr.removePlayer(data.id);
      setPlayerList((prev) => prev.filter((p) => p.id !== data.id));
      setActiveRemotePlayers(Array.from(remoteMgr.players.values()));
    });

    networkManager.onChatMessage((msg) => {
      setChatMessages((prev) => [...prev, msg]);
      soundEngine.playChatChime();

      // If remote player sent message, attach speech bubble
      if (msg.playerId !== networkManager.selfId && msg.playerId !== 'system') {
        remoteMgr.setSpeechBubble(msg.playerId, msg.text);
        setActiveRemotePlayers(Array.from(remoteMgr.players.values()));
      }
    });

    // 8. Event Listeners for Movement, Emotes & Camera (Keyboard)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setIsChatFocused((prev) => !prev);
        return;
      }

      if (isChatFocused || isPlayersModalOpen || isHelpModalOpen || isServerModalOpen || isWardrobeOpen) return;

      // Emote Hotkeys 1-5
      if (e.key === '1') {
        triggerEmote('wave');
        return;
      } else if (e.key === '2') {
        triggerEmote('dance');
        return;
      } else if (e.key === '3') {
        triggerEmote('salute');
        return;
      } else if (e.key === '4') {
        triggerEmote('cheer');
        return;
      } else if (e.key === '5') {
        triggerEmote('clap');
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.w = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.s = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.a = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.d = true;
          break;
        case 'Space':
          if (!keysRef.current.space) {
            keysRef.current.space = true;
            triggerJump();
          }
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.w = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.s = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.a = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.d = false;
          break;
        case 'Space':
          keysRef.current.space = false;
          break;
      }
    };

    // Mouse Listeners
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !tpCameraRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      tpCameraRef.current.rotate(dx, dy);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!tpCameraRef.current) return;
      tpCameraRef.current.zoom(e.deltaY);
    };

    // Touch orbit dragging for mobile
    let touchStartPos = { x: 0, y: 0 };
    let initialPinchDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && tpCameraRef.current) {
        const dx = e.touches[0].clientX - touchStartPos.x;
        const dy = e.touches[0].clientY - touchStartPos.y;
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        tpCameraRef.current.rotate(dx * 1.5, dy * 1.5);
      } else if (e.touches.length === 2 && tpCameraRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = initialPinchDistance - dist;
        tpCameraRef.current.zoom(delta * 0.5);
        initialPinchDistance = dist;
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasDom.addEventListener('wheel', handleWheel, { passive: true });

    canvasDom.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvasDom.addEventListener('touchmove', handleTouchMove, { passive: true });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      setViewportSize({ width: w, height: h });
    };

    window.addEventListener('resize', handleResize);

    // 10. Third-Person Camera Rig
    const tpCamera = new ThirdPersonCamera(camera);
    tpCameraRef.current = tpCamera;

    // 11. Main Animation Game Loop (Clock driven)
    const clock = new THREE.Clock();
    let animFrameId: number;
    let syncTickAccumulator = 0;
    let billboardSyncAccumulator = 0;

    const gameLoop = () => {
      animFrameId = requestAnimationFrame(gameLoop);
      const delta = Math.min(clock.getDelta(), 0.1); // Cap delta to prevent tunneling

      // Animate ambient world objects (water waves, campfire light flicker)
      worldEnv.update(delta, clock.getElapsedTime());

      // A. Player Movement & Physics (when entered)
      if (hasEnteredRef.current) {
        let moveX = 0;
        let moveZ = 0;

        // Keyboard input
        if (!isChatFocused) {
          if (keysRef.current.w) moveZ -= 1;
          if (keysRef.current.s) moveZ += 1;
          if (keysRef.current.a) moveX -= 1;
          if (keysRef.current.d) moveX += 1;
        }

        // Virtual joystick touch input (normalized -1 to 1)
        if (Math.abs(touchMoveRef.current.x) > 0.05 || Math.abs(touchMoveRef.current.z) > 0.05) {
          moveX = touchMoveRef.current.x;
          moveZ = touchMoveRef.current.z;
        }

        const inputLen = Math.hypot(moveX, moveZ);
        const isMoving = inputLen > 0.1;
        isMovingRef.current = isMoving;

        // Reset sitting or waving emote if player starts walking
        if (isMoving && localRigRef.current && localRigRef.current.currentEmote !== 'none') {
          localRigRef.current.currentEmote = 'none';
          setCurrentEmote('none');
        }

        if (isMoving) {
          const normX = moveX / inputLen;
          const normZ = moveZ / inputLen;

          // Camera-relative movement vector
          const camAngle = tpCamera.theta;
          const worldDirX = normX * Math.cos(camAngle) + normZ * Math.sin(camAngle);
          const worldDirZ = -normX * Math.sin(camAngle) + normZ * Math.cos(camAngle);

          const moveSpeed = 6.2; // Smooth exploratory walking speed
          playerPosRef.current.x += worldDirX * moveSpeed * delta;
          playerPosRef.current.z += worldDirZ * moveSpeed * delta;

          // Smoothly rotate character to face travel direction
          const targetRotY = Math.atan2(worldDirX, worldDirZ);
          let diff = (targetRotY - playerRotYRef.current) % (Math.PI * 2);
          if (diff < -Math.PI) diff += Math.PI * 2;
          if (diff > Math.PI) diff -= Math.PI * 2;
          playerRotYRef.current += diff * Math.min(1, delta * 15);

          // Sound
          if (isGroundedRef.current) {
            soundEngine.playStep();
          }
        }

        // Gravity & Jump Physics
        const gravity = 22.0;
        playerVelocityRef.current.y -= gravity * delta;
        playerPosRef.current.y += playerVelocityRef.current.y * delta;

        // Ground Height Check
        const groundY = getTerrainHeight(playerPosRef.current.x, playerPosRef.current.z);
        if (playerPosRef.current.y <= groundY) {
          playerPosRef.current.y = groundY;
          playerVelocityRef.current.y = 0;
          isGroundedRef.current = true;
          isJumpingRef.current = false;
        }

        // Clamp to world radius ~54 units
        const distFromCenter = Math.hypot(playerPosRef.current.x, playerPosRef.current.z);
        if (distFromCenter > 54) {
          const ratio = 54 / distFromCenter;
          playerPosRef.current.x *= ratio;
          playerPosRef.current.z *= ratio;
        }

        // Update local character rig
        if (localRigRef.current) {
          localRigRef.current.root.position.copy(playerPosRef.current);
          localRigRef.current.root.rotation.y = playerRotYRef.current;
          animateCharacterRig(
            localRigRef.current,
            delta,
            isMoving,
            !isGroundedRef.current
          );
        }

        // Campfire audio proximity
        soundEngine.updateCampfireProximity(distFromCenter);

        // Network replication tick (every ~40ms)
        syncTickAccumulator += delta;
        if (syncTickAccumulator >= 0.04) {
          syncTickAccumulator = 0;
          networkManager.sendMovement(
            playerPosRef.current,
            playerRotYRef.current,
            isMoving,
            !isGroundedRef.current,
            localRigRef.current?.currentEmote
          );
        }

        // Update local 3D speech bubble timeout
        if (localRigRef.current?.speechBubbleSprite && localRigRef.current.speechBubbleTimer !== undefined) {
          localRigRef.current.speechBubbleTimer -= delta;
          if (localRigRef.current.speechBubbleTimer <= 0) {
            localRigRef.current.root.remove(localRigRef.current.speechBubbleSprite);
            localRigRef.current.speechBubbleSprite.material.dispose();
            localRigRef.current.speechBubbleSprite = undefined;
          }
        }

        // Periodic state sync for 2D UI overlay (distance etc)
        setSelfPosState({
          x: playerPosRef.current.x,
          y: playerPosRef.current.y,
          z: playerPosRef.current.z,
        });
      }

      // B. Update Remote Players
      remoteMgr.update(delta);

      // Keep active remote players synced for 2D billboard labels
      billboardSyncAccumulator += delta;
      if (billboardSyncAccumulator >= 0.08) {
        billboardSyncAccumulator = 0;
        if (remoteMgr.players.size > 0 || activeRemotePlayers.length > 0) {
          setActiveRemotePlayers(Array.from(remoteMgr.players.values()));
        }
      }

      // C. Update Third Person Camera following player target
      tpCamera.update(playerPosRef.current, delta);

      // D. Render Frame
      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvasDom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasDom.removeEventListener('wheel', handleWheel);
      canvasDom.removeEventListener('touchstart', handleTouchStart);
      canvasDom.removeEventListener('touchmove', handleTouchMove);

      remoteMgr.clear();

      scene.traverse((obj) => {
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

      renderer.dispose();
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Layer */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full canvas-container" />

      {/* Top Header Bar HUD */}
      <header className="fixed top-0 left-0 right-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3.5 pointer-events-none">
        {/* Mobile Minimal Header (md:hidden) */}
        <div className="flex md:hidden items-center justify-between pointer-events-auto">
          {/* Mobile Camera View Cycle Button */}
          <button
            type="button"
            onClick={handleCycleCameraPreset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-xl text-xs font-semibold text-white backdrop-blur-md active:scale-95 transition-all min-h-[44px]"
            title="카메라 시점 변경"
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span>시점: {cameraPreset === 'close' ? '근접' : cameraPreset === 'normal' ? '기본' : cameraPreset === 'far' ? '원거리' : '탑뷰'}</span>
          </button>

          {/* Mobile Right Controls: Chat & Quick Menu */}
          <div className="flex items-center gap-2">
            {hasEntered && (
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="relative flex items-center justify-center w-11 h-11 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-xl text-white backdrop-blur-md active:scale-95 transition-all"
                title="채팅 열기"
                aria-label="실시간 채팅 열기"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                {chatMessages.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2.5 right-2.5 ring-2 ring-slate-900" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center w-11 h-11 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 rounded-2xl shadow-xl text-white backdrop-blur-md active:scale-95 transition-all"
              title="메뉴 열기"
              aria-label="더보기 메뉴 열기"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </div>

        {/* Desktop Full Header (hidden md:flex) */}
        <div className="hidden md:flex items-center justify-between pointer-events-none">
          {/* Zone 1: Camera Preset Quick Switcher */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/70 shadow-lg pointer-events-auto">
            {(['close', 'normal', 'far', 'top'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  cameraPreset === preset
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {preset === 'close' ? '근접' : preset === 'normal' ? '기본' : preset === 'far' ? '원거리' : '탑뷰'}
              </button>
            ))}
          </div>

          {/* Zone 2: Title & Branding */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/70 shadow-lg">
            <div
              className="w-3.5 h-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: selfAppearance.shirtColor }}
            />
            <span className="text-xs font-bold tracking-wide text-white">
              Meta World
            </span>
            <span className="text-xs text-slate-400 font-medium">자연 프로토타입</span>
          </div>

          {/* Zone 3: Primary Action & Player status */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-red-950/60 border-red-800/60 text-red-400 hover:bg-red-900/60'
                  : 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* In-game Wardrobe Button */}
            {hasEntered && (
              <button
                onClick={() => setIsWardrobeOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 border border-amber-500/70 rounded-xl shadow-lg text-[11px] font-bold text-white transition-all hover:scale-105"
                title="캐릭터 스타일 및 옷장 변경"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>옷장</span>
              </button>
            )}

            {/* Online Players Button */}
            {hasEntered && (
              <button
                onClick={() => setIsPlayersModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl shadow-lg text-[11px] font-medium text-slate-200 transition-colors"
                title="접속자 목록"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>접속자</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-semibold">
                  {playerList.length}
                </span>
              </button>
            )}

            {/* Controls Help */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="조작 안내"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Connection status button */}
            <button
              onClick={() => setIsServerModalOpen(true)}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl shadow-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors"
              title="게임 서버 설정 및 연결 확인"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className={isConnected ? 'text-emerald-300' : 'text-amber-300'}>
                {isConnected ? '온라인' : '연결 대기중'}
              </span>
              <Server className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Emote / Action Bar */}
      {hasEntered && (
        <EmoteBar
          currentEmote={currentEmote}
          onTriggerEmote={triggerEmote}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
          isChatFocused={isChatFocused}
        />
      )}

      {/* Mobile On-Screen Virtual Touch Controls (Always visible on mobile screens < 768px, hidden on desktop screens) */}
      {hasEntered && (
        <div className="md:hidden">
          {/* Left: Virtual Joystick */}
          <div className="fixed bottom-6 left-5 z-30 pointer-events-auto">
            <VirtualJoystick
              onMove={(move) => {
                touchMoveRef.current = move;
              }}
            />
          </div>

          {/* Right: Touch Jump Button */}
          <div className="fixed bottom-6 right-5 z-30 pointer-events-auto">
            <TouchJumpButton onJump={triggerJump} />
          </div>
        </div>
      )}

      {/* Initial Entry Modal */}
      {!hasEntered && (
        <WorldEntryModal
          onJoin={handleJoinWorld}
          isConnected={isConnected}
          onOpenServerConfig={() => setIsServerModalOpen(true)}
        />
      )}

      {/* Real-Time Chat Overlay */}
      {hasEntered && (
        <ChatOverlay
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          selfNickname={selfNickname}
          isChatFocused={isChatFocused}
          setIsChatFocused={setIsChatFocused}
          isMobileDrawerOpen={isMobileDrawerOpen}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        />
      )}

      {/* Mobile Quick Sheet Menu (Consolidates secondary tools) */}
      <MobileQuickMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenWardrobe={() => setIsWardrobeOpen(true)}
        onOpenPlayers={() => setIsPlayersModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenServer={() => setIsServerModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={handleSelectPreset}
        playerCount={playerList.length}
        isConnected={isConnected}
        selfNickname={selfNickname}
        shirtColor={selfAppearance.shirtColor}
      />

      {/* In-game Wardrobe / Character Customizer Modal */}
      <CharacterCustomizerModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        currentAppearance={selfAppearance}
        onApplyAppearance={handleApplyAppearance}
      />

      {/* Online Players Modal */}
      <OnlinePlayersModal
        isOpen={isPlayersModalOpen}
        onClose={() => setIsPlayersModalOpen(false)}
        selfId={selfId}
        selfPos={selfPosState}
        players={playerList}
      />

      {/* Controls Help Modal */}
      <ControlsHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Server Config Modal */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        isConnected={isConnected}
      />
    </div>
  );
}
