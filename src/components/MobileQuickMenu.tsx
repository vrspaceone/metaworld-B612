import React from 'react';
import { X, Shirt, Users, Volume2, VolumeX, HelpCircle, Server, Video, Sparkles } from 'lucide-react';
import { CameraPreset } from '../types/game.ts';

interface MobileQuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWardrobe: () => void;
  onOpenPlayers: () => void;
  onOpenHelp: () => void;
  onOpenServer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  playerCount: number;
  isConnected: boolean;
  selfNickname: string;
  shirtColor: string;
}

export const MobileQuickMenu: React.FC<MobileQuickMenuProps> = ({
  isOpen,
  onClose,
  onOpenWardrobe,
  onOpenPlayers,
  onOpenHelp,
  onOpenServer,
  isMuted,
  onToggleMute,
  cameraPreset,
  onSelectCameraPreset,
  playerCount,
  isConnected,
  selfNickname,
  shirtColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150">
      <div className="w-full bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl p-5 text-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md"
              style={{ backgroundColor: shirtColor }}
            >
              {selfNickname.slice(0, 1)}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{selfNickname}</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  모바일 메뉴
                </span>
              </div>
              <div className="text-[11px] text-slate-400">메타월드 기능 모음</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* 1. Wardrobe / Character */}
          <button
            onClick={() => {
              onClose();
              onOpenWardrobe();
            }}
            className="p-3 bg-gradient-to-br from-amber-950/40 to-slate-800 border border-amber-800/50 hover:border-amber-600 rounded-2xl text-left transition-all active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Shirt className="w-4 h-4" />
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400/70" />
            </div>
            <div className="text-xs font-bold text-white">캐릭터 옷장</div>
            <div className="text-[10px] text-slate-400">의상, 모자, 날개 커스텀</div>
          </button>

          {/* 2. Online Players */}
          <button
            onClick={() => {
              onClose();
              onOpenPlayers();
            }}
            className="p-3 bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 rounded-2xl text-left transition-all active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {playerCount}명
              </span>
            </div>
            <div className="text-xs font-bold text-white">접속자 목록</div>
            <div className="text-[10px] text-slate-400">현재 탐험 중인 플레이어</div>
          </button>

          {/* 3. Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-3 bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 rounded-2xl text-left transition-all active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div
                className={`p-2 rounded-xl ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isMuted ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {isMuted ? '음소거' : '켜짐'}
              </span>
            </div>
            <div className="text-xs font-bold text-white">사운드 효과</div>
            <div className="text-[10px] text-slate-400">모닥불 & 발소리 음향</div>
          </button>

          {/* 4. Controls Help */}
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="p-3 bg-slate-800/70 border border-slate-700/60 hover:border-slate-600 rounded-2xl text-left transition-all active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-bold text-white">조작 안내</div>
            <div className="text-[10px] text-slate-400">이동 & 시점 제어 방법</div>
          </button>
        </div>

        {/* Camera Preset Selector */}
        <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl mb-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <Video className="w-3.5 h-3.5 text-blue-400" />
            <span>카메라 시점 변경</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
            {(['close', 'normal', 'far', 'top'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => onSelectCameraPreset(preset)}
                className={`py-2 rounded-xl transition-all ${
                  cameraPreset === preset
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                {preset === 'close'
                  ? '근접'
                  : preset === 'normal'
                  ? '기본'
                  : preset === 'far'
                  ? '원거리'
                  : '탑뷰'}
              </button>
            ))}
          </div>
        </div>

        {/* Server Connection Status & Config */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className={isConnected ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'}>
              {isConnected ? '소켓 서버 정상 연결' : '연결 대기중'}
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenServer();
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            <Server className="w-3 h-3 text-blue-400" />
            <span>서버 설정</span>
          </button>
        </div>
      </div>
    </div>
  );
};
