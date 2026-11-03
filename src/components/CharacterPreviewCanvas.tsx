import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterAppearance, CharacterEmote } from '../types/game.ts';
import { CharacterRig, animateCharacterRig, createCharacter } from '../game/character.ts';

interface CharacterPreviewCanvasProps {
  appearance: CharacterAppearance;
  emote?: CharacterEmote;
  className?: string;
  autoRotate?: boolean;
}

export const CharacterPreviewCanvas: React.FC<CharacterPreviewCanvasProps> = ({
  appearance,
  emote = 'none',
  className = 'w-full h-64',
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<CharacterRig | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rotYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 1.1, 2.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Soft Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445566, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(2.5, 4, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-3, 2, -1);
    scene.add(fillLight);

    // Pedestal disk
    const diskGeo = new THREE.CylinderGeometry(0.85, 0.9, 0.08, 24);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.y = -0.04;
    disk.receiveShadow = true;
    scene.add(disk);

    // Initial Rig
    const rig = createCharacter(appearance);
    rig.currentEmote = emote;
    scene.add(rig.root);
    rigRef.current = rig;

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current && rigRef.current) {
        rotYRef.current += delta * 0.75;
      }

      if (rigRef.current) {
        rigRef.current.root.rotation.y = rotYRef.current;
        animateCharacterRig(rigRef.current, delta, false, false);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Drag to spin character
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;
      rotYRef.current += dx * 0.015;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

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

  // Update appearance in place without reconstructing the entire scene
  useEffect(() => {
    if (!sceneRef.current || !rigRef.current) return;

    const scene = sceneRef.current;
    const oldRoot = rigRef.current.root;
    scene.remove(oldRoot);

    oldRoot.traverse((obj) => {
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
    newRig.currentEmote = emote;
    newRig.root.rotation.y = rotYRef.current;
    scene.add(newRig.root);
    rigRef.current = newRig;
  }, [appearance, emote]);

  return (
    <div className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-1 right-2 text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
        드래그하여 360° 회전
      </div>
    </div>
  );
};
