import React, { useState } from 'react';
import { CharacterEmote } from '../types/game.ts';
import { Shirt, Sparkles, X } from 'lucide-react';

interface EmoteBarProps {
  currentEmote: CharacterEmote;
  onTriggerEmote: (emote: CharacterEmote) => void;
  onOpenWardrobe: () => void;
  isChatFocused: boolean;
}

interface EmoteItem {
  id: CharacterEmote;
  label: string;
  key: string;
  icon: string;
}

const EMOTE_ITEMS: EmoteItem[] = [
  { id: 'wave', label: '인사', key: '1', icon: '👋' },
  { id: 'dance', label: '댄스', key: '2', icon: '💃' },
  { id: 'salute', label: '경례', key: '3', icon: '🫡' },
  { id: 'cheer', label: '환호', key: '4', icon: '🙌' },
  { id: 'clap', label: '박수', key: '5', icon: '👏' },
];

export const EmoteBar: React.FC<EmoteBarProps> = ({
  currentEmote,
  onTriggerEmote,
  onOpenWardrobe,
  isChatFocused,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeItem = EMOTE_ITEMS.find((item) => item.id === currentEmote);

  return (
    <>
      {/* 1. Desktop Emote Bar (hidden on mobile, visible md and up) */}
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md transition-all">
          {EMOTE_ITEMS.map((item) => {
            const isActive = currentEmote === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTriggerEmote(isActive ? 'none' : item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/50'
                }`}
                title={`${item.label} (${item.key}번 키)`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-[10px] opacity-60 font-mono">[{item.key}]</span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-700/70 mx-1" />

          {/* Character Wardrobe Button */}
          <button
            onClick={onOpenWardrobe}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/90 to-amber-500/90 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105"
            title="캐릭터 스타일 및 옷장 변경"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>옷장</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile Minimal Floating Emote Toggle (Visible on mobile only, above jump button) */}
      <div className="md:hidden fixed bottom-24 right-5 z-30 pointer-events-auto flex flex-col items-end gap-2">
        {/* Expanded Popup Menu */}
        {isMobileMenuOpen && (
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {EMOTE_ITEMS.map((item) => {
              const isActive = currentEmote === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTriggerEmote(isActive ? 'none' : item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:bg-slate-700'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="pr-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Emote Launcher Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border backdrop-blur-md transition-all active:scale-95 ${
            isMobileMenuOpen
              ? 'bg-slate-800 border-slate-600 text-white'
              : currentEmote !== 'none'
              ? 'bg-blue-600/95 border-blue-400 text-white ring-2 ring-blue-400/50 animate-pulse'
              : 'bg-slate-900/85 border-slate-700 text-slate-200'
          }`}
          title="동작 및 감정 표현"
          aria-label="감정 표현 메뉴 열기"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-slate-300" />
          ) : activeItem ? (
            <span className="text-xl">{activeItem.icon}</span>
          ) : (
            <Sparkles className="w-5 h-5 text-amber-300" />
          )}
        </button>
      </div>
    </>
  );
};
