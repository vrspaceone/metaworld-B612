import React, { useState } from 'react';
import { Compass, Users, Sparkles, Move3d, Server, AlertCircle, CheckCircle2, Shirt, Wand2 } from 'lucide-react';
import { CharacterAppearance } from '../types/game.ts';
import { CHARACTER_PRESETS, CharacterPreset, DEFAULT_APPEARANCE } from '../game/character.ts';
import { CharacterPreviewCanvas } from './CharacterPreviewCanvas.tsx';
import { CharacterCustomizerModal } from './CharacterCustomizerModal.tsx';

interface WorldEntryModalProps {
  onJoin: (nickname: string, color: string, appearance: CharacterAppearance) => void;
  isConnected: boolean;
  onOpenServerConfig: () => void;
}

export const WorldEntryModal: React.FC<WorldEntryModalProps> = ({
  onJoin,
  isConnected,
  onOpenServerConfig,
}) => {
  const [nickname, setNickname] = useState(() => `탐험가_${Math.floor(Math.random() * 899 + 100)}`);
  const [appearance, setAppearance] = useState<CharacterAppearance>(CHARACTER_PRESETS[0].appearance);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim() || '탐험가';
    onJoin(cleanName, appearance.shirtColor, appearance);
  };

  const handleSelectPreset = (preset: CharacterPreset) => {
    setAppearance({ ...preset.appearance });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 text-white overflow-hidden max-h-[92vh] overflow-y-auto">
          {/* Subtle decorative background gradient */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: appearance.shirtColor }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300"
                style={{ backgroundColor: appearance.shirtColor }}
              >
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Meta World
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    자연 3D 멀티플레이
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  아바타를 선택하고 자연 가상 세계에 접속하세요
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenServerConfig}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="소켓 서버 설정"
            >
              <Server className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">서버 설정</span>
            </button>
          </div>

          {/* Connection Notice */}
          <div
            className={`mb-4 px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs ${
              isConnected
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {isConnected
                  ? '실시간 멀티플레이 서버 연결 완료'
                  : '소켓 서버 연결 중...'}
              </span>
            </div>
            {!isConnected && (
              <button
                type="button"
                onClick={onOpenServerConfig}
                className="underline hover:text-white text-[11px] shrink-0 font-semibold ml-2"
              >
                URL 확인
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Character Preview & Archetype Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
              {/* 3D Character Preview (5 cols) */}
              <div className="sm:col-span-5 h-56 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner flex flex-col items-center justify-center p-2 relative">
                <CharacterPreviewCanvas appearance={appearance} className="w-full h-full" />
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="absolute bottom-2 left-2 right-2 py-1.5 px-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md backdrop-blur-sm"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>세부 스타일 & 옷장</span>
                </button>
              </div>

              {/* Character Presets & Nickname (7 cols) */}
              <div className="sm:col-span-7 space-y-3">
                {/* Nickname Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    플레이어 닉네임
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 14))}
                    placeholder="닉네임을 입력하세요"
                    maxLength={14}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                  />
                </div>

                {/* Quick Archetype Preset Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      아바타 캐릭터 선택
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomizerOpen(true)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      직접 커스텀
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {CHARACTER_PRESETS.map((preset) => {
                      const isSelected =
                        appearance.hairStyle === preset.appearance.hairStyle &&
                        appearance.outfit === preset.appearance.outfit &&
                        appearance.accessory === preset.appearance.accessory;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-blue-950/60 border-blue-400 text-white ring-1 ring-blue-400 shadow'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                          }`}
                        >
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-xs font-bold truncate">{preset.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Quick Guide */}
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <Move3d className="w-4 h-4 text-emerald-400" />
                <span>조작 가이드</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-slate-400 pt-1">
                <div><strong className="text-slate-200 font-mono">W, A, S, D</strong> 이동</div>
                <div><strong className="text-slate-200 font-mono">Space</strong> 점프</div>
                <div><strong className="text-slate-200">마우스 드래그</strong> 시점</div>
                <div><strong className="text-slate-200 font-mono">1~5 키</strong> 감정표현</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 hover:brightness-110"
              style={{ backgroundColor: appearance.shirtColor }}
            >
              <Users className="w-4 h-4" />
              자연 월드 입장하기
            </button>
          </form>
        </div>
      </div>

      {/* Wardrobe Customizer Modal */}
      <CharacterCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentAppearance={appearance}
        onApplyAppearance={(newApp) => setAppearance(newApp)}
      />
    </>
  );
};
