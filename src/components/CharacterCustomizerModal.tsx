import React, { useState } from 'react';
import { X, Shirt, Sparkles, Check, RefreshCw, Wand2 } from 'lucide-react';
import {
  BackAccessory,
  CharacterAppearance,
  CharacterEmote,
  FaceStyle,
  HairStyle,
  OutfitStyle,
} from '../types/game.ts';
import { CHARACTER_PRESETS, CharacterPreset } from '../game/character.ts';
import { CharacterPreviewCanvas } from './CharacterPreviewCanvas.tsx';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppearance: CharacterAppearance;
  onApplyAppearance: (newAppearance: CharacterAppearance) => void;
}

const SHIRT_COLORS = [
  { name: '오션 블루', hex: '#3b82f6' },
  { name: '에메랄드 포레스트', hex: '#10b981' },
  { name: '앰버 선셋', hex: '#f59e0b' },
  { name: '미스틱 바이올렛', hex: '#8b5cf6' },
  { name: '로즈 코랄', hex: '#f43f5e' },
  { name: '나이트 슬레이트', hex: '#475569' },
  { name: '스노우 화이트', hex: '#f8fafc' },
  { name: '네이처 올리브', hex: '#65a30d' },
];

const PANTS_COLORS = [
  { name: '다크 슬레이트', hex: '#1e293b' },
  { name: '딥 블랙', hex: '#0f172a' },
  { name: '카키 베이지', hex: '#78716c' },
  { name: '미드나이트 블루', hex: '#172554' },
  { name: '포레스트 그린', hex: '#064e3b' },
];

const HAIR_COLORS = [
  { name: '체스트넛 다크브라운', hex: '#332219' },
  { name: '허니 블론드', hex: '#ca8a04' },
  { name: '골든 브라운', hex: '#78350f' },
  { name: '미드나이트 블랙', hex: '#171717' },
  { name: '루비 레드', hex: '#991b1b' },
  { name: '포레스트 그린', hex: '#065f46' },
  { name: '스카이 블루', hex: '#0284c7' },
];

const SKIN_TONES = [
  { name: '웜 피치', hex: '#fcd34d' },
  { name: '페어 내추럴', hex: '#fef08a' },
  { name: '라이트 베이지', hex: '#fed7aa' },
  { name: '선키스트 탠', hex: '#fba575' },
  { name: '딥 카카오', hex: '#a16207' },
];

const HAIR_STYLES: { id: HairStyle; label: string; icon: string }[] = [
  { id: 'casual', label: '단정한 헤어', icon: '💇' },
  { id: 'explorer_hat', label: '사파리 탐험모', icon: '🧭' },
  { id: 'animal_ears', label: '동물 귀 모자', icon: '🐱' },
  { id: 'beanie', label: '따뜻한 비니', icon: '🎿' },
  { id: 'crown', label: '자연의 화관', icon: '🌸' },
  { id: 'headphones', label: '트렌디 헤드폰', icon: '🎧' },
];

const FACE_STYLES: { id: FaceStyle; label: string; icon: string }[] = [
  { id: 'smile', label: '다정한 미소', icon: '😊' },
  { id: 'wink', label: '깜찍한 윙크', icon: '😉' },
  { id: 'cool_glasses', label: '선글라스', icon: '😎' },
  { id: 'sparkle', label: '초롱초롱 눈망울', icon: '✨' },
];

const OUTFIT_STYLES: { id: OutfitStyle; label: string; desc: string }[] = [
  { id: 'explorer', label: '탐험가 조끼', desc: '포켓 & 벨트 장착' },
  { id: 'hoodie', label: '이지 후드티', desc: '포근한 캐주얼 후디' },
  { id: 'adventurer', label: '어드벤처 튜닉', desc: '크로스 벨트 & 엠블럼' },
  { id: 'nature_guardian', label: '자연의 수호자', desc: '잎사귀 견장 튜닉' },
];

const ACCESSORY_STYLES: { id: BackAccessory; label: string; icon: string }[] = [
  { id: 'backpack', label: '탐험 배낭', icon: '🎒' },
  { id: 'leaf_wings', label: '잎사귀 날개', icon: '🍃' },
  { id: 'lantern', label: '캠핑 랜턴', icon: '🏮' },
  { id: 'camp_roll', label: '침낭 & 수통', icon: '⛺' },
  { id: 'none', label: '장식 없음', icon: '❌' },
];

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentAppearance,
  onApplyAppearance,
}) => {
  const [appearance, setAppearance] = useState<CharacterAppearance>(currentAppearance);
  const [activeTab, setActiveTab] = useState<'presets' | 'style' | 'colors'>('presets');
  const [previewEmote, setPreviewEmote] = useState<CharacterEmote>('none');

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyAppearance(appearance);
    onClose();
  };

  const handleSelectPreset = (preset: CharacterPreset) => {
    setAppearance({ ...preset.appearance });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl shadow-md">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                캐릭터 커스터마이징 & 옷장
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  실시간 월드 동기화
                </span>
              </h2>
              <p className="text-xs text-slate-400">자신만의 독특한 탐험가 아바타를 꾸며보세요.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left 3D Viewport & Right Controls */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: 3D Preview Panel (5 Cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-950/60 to-slate-900/80 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span className="font-semibold text-slate-300">아바타 3D 미리보기</span>
              <span className="text-[11px] text-amber-400 font-medium">360° 회전 가능</span>
            </div>

            {/* 3D Canvas Container */}
            <div className="w-full h-64 md:h-72 rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center">
              <CharacterPreviewCanvas
                appearance={appearance}
                emote={previewEmote}
                className="w-full h-full"
              />
            </div>

            {/* Test Emote Bar inside preview */}
            <div className="w-full mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">모션 테스트:</div>
              <div className="grid grid-cols-6 gap-1 text-[11px]">
                {[
                  { id: 'none', label: '대기', icon: '🧍' },
                  { id: 'wave', label: '인사', icon: '👋' },
                  { id: 'dance', label: '댄스', icon: '💃' },
                  { id: 'clap', label: '박수', icon: '👏' },
                  { id: 'cheer', label: '환호', icon: '🙌' },
                  { id: 'salute', label: '경례', icon: '🫡' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPreviewEmote(m.id as CharacterEmote)}
                    className={`py-1 rounded-lg text-center font-medium transition-colors border ${
                      previewEmote === m.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-750'
                    }`}
                    title={m.label}
                  >
                    <span>{m.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Options & Categories (7 Cols) */}
          <div className="md:col-span-7 flex flex-col p-4 sm:p-6 overflow-y-auto max-h-[550px]">
            {/* Category Navigation Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>추천 프리셋</span>
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'style'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>스타일 파츠</span>
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'colors'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>색상 팔레트</span>
              </button>
            </div>

            {/* TAB 1: PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  취향에 맞는 완성형 모험가 아바타를 선택해보세요:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CHARACTER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        appearance.hairStyle === preset.appearance.hairStyle &&
                        appearance.outfit === preset.appearance.outfit &&
                        appearance.accessory === preset.appearance.accessory
                          ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60'
                      }`}
                    >
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-700 shrink-0">
                        {preset.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {preset.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: STYLE PARTS */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* 1. Hair / Headgear */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    헤어 & 모자 / 헤드기어
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setAppearance((prev) => ({ ...prev, hairStyle: h.id }))}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs ${
                          appearance.hairStyle === h.id
                            ? 'bg-blue-600 border-blue-400 text-white shadow'
                            : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 text-slate-300'
                        }`}
                      >
                        <span className="text-lg">{h.icon}</span>
                        <span className="text-[11px] font-medium">{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Face Style */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    얼굴 표정
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FACE_STYLES.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setAppearance((prev) => ({ ...prev, faceStyle: f.id }))}
                        className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 text-xs ${
                          appearance.faceStyle === f.id
                            ? 'bg-blue-600 border-blue-400 text-white shadow'
                            : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 text-slate-300'
                        }`}
                      >
                        <span className="text-base">{f.icon}</span>
                        <span className="text-[11px] font-medium">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Outfit Style */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    상의 의상 스타일
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTFIT_STYLES.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setAppearance((prev) => ({ ...prev, outfit: o.id }))}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          appearance.outfit === o.id
                            ? 'bg-blue-600 border-blue-400 text-white shadow'
                            : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{o.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{o.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Back Accessory */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    등 장식 & 소품
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {ACCESSORY_STYLES.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAppearance((prev) => ({ ...prev, accessory: a.id }))}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs ${
                          appearance.accessory === a.id
                            ? 'bg-blue-600 border-blue-400 text-white shadow'
                            : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/70 text-slate-300'
                        }`}
                      >
                        <span className="text-base">{a.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* Shirt Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    의상 상의 색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SHIRT_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setAppearance((prev) => ({ ...prev, shirtColor: c.hex }))}
                        className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                          appearance.shirtColor === c.hex
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {appearance.shirtColor === c.hex && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pants Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    하의 바지 색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PANTS_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setAppearance((prev) => ({ ...prev, pantsColor: c.hex }))}
                        className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                          appearance.pantsColor === c.hex
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {appearance.pantsColor === c.hex && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    머리카락 색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setAppearance((prev) => ({ ...prev, hairColor: c.hex }))}
                        className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                          appearance.hairColor === c.hex
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {appearance.hairColor === c.hex && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    피부톤 (스킨)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setAppearance((prev) => ({ ...prev, skinColor: c.hex }))}
                        className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                          appearance.skinColor === c.hex
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {appearance.skinColor === c.hex && (
                          <Check className="w-4 h-4 text-slate-900 drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSelectPreset(CHARACTER_PRESETS[0])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>기본 탐험가로 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>월드에 적용하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
