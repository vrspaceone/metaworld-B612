import React, { useRef, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (move: { x: number; z: number }) => void;
  className?: string;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, className = '' }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);

  const maxRadius = 40; // Max movement radius in pixels

  const updateKnob = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    let normX = 0;
    let normZ = 0;

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
    } else if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      normX = Math.cos(angle);
      normZ = Math.sin(angle);
      setKnobPos({
        x: normX * maxRadius,
        y: normZ * maxRadius,
      });
    } else {
      normX = dx / maxRadius;
      normZ = dy / maxRadius;
      setKnobPos({ x: dx, y: dy });
    }

    // In 3D space, Y screen drag corresponds to Z axis movement (up on screen = forward = -Z)
    onMove({
      x: normX,
      z: normZ,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsActive(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    activePointerIdRef.current = null;
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, z: 0 });
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-28 h-28 rounded-full bg-slate-900/75 border-2 ${
        isActive ? 'border-blue-400 bg-slate-900/90 shadow-lg shadow-blue-500/20' : 'border-slate-600/80'
      } backdrop-blur-md flex items-center justify-center touch-none select-none z-30 transition-colors ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Direction Cross Markings */}
      <div className="absolute w-1 h-3 bg-slate-500/50 top-1.5 rounded-full pointer-events-none" />
      <div className="absolute w-1 h-3 bg-slate-500/50 bottom-1.5 rounded-full pointer-events-none" />
      <div className="absolute h-1 w-3 bg-slate-500/50 left-1.5 rounded-full pointer-events-none" />
      <div className="absolute h-1 w-3 bg-slate-500/50 right-1.5 rounded-full pointer-events-none" />

      {/* Movable Thumb Knob */}
      <div
        className={`w-12 h-12 rounded-full border-2 transition-transform duration-75 shadow-lg flex items-center justify-center pointer-events-none ${
          isActive
            ? 'bg-blue-500 border-white scale-105'
            : 'bg-slate-700/95 border-slate-300/80'
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-white/60" />
      </div>
    </div>
  );
};

interface TouchJumpButtonProps {
  onJump: () => void;
  className?: string;
}

export const TouchJumpButton: React.FC<TouchJumpButtonProps> = ({ onJump, className = '' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onJump();
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all touch-none select-none z-30 font-bold text-xs ${
        isPressed
          ? 'bg-emerald-500 border-white text-white scale-95 shadow-emerald-500/50'
          : 'bg-slate-900/85 border-slate-600/80 text-slate-200 backdrop-blur-md'
      } ${className}`}
      style={{ touchAction: 'none' }}
      title="점프 (Jump)"
      aria-label="점프"
    >
      <svg
        className="w-5 h-5 mb-0.5 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <span className="text-[10px] tracking-wider uppercase font-mono pointer-events-none">JUMP</span>
    </button>
  );
};
