import React from 'react';
import { X, Users, MapPin } from 'lucide-react';
import { PlayerData, Vector3D } from '../types/game.ts';

interface OnlinePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selfId: string | null;
  selfPos: Vector3D;
  players: PlayerData[];
}

export const OnlinePlayersModal: React.FC<OnlinePlayersModalProps> = ({
  isOpen,
  onClose,
  selfId,
  selfPos,
  players,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">동일 월드 접속자 목록</h2>
            <span className="px-2 py-0.5 bg-slate-800 text-xs font-mono text-emerald-400 rounded-md border border-slate-700">
              {players.length}명
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {players.map((p) => {
            const isMe = p.id === selfId;
            const dist = Math.hypot(p.position.x - selfPos.x, p.position.z - selfPos.z);
            let locationDesc = '자연 월드 탐험 중';
            const distToCenter = Math.hypot(p.position.x, p.position.z);
            const distToLake = Math.hypot(p.position.x - 18, p.position.z + 12);

            if (distToCenter < 6) locationDesc = '중앙 모닥불 광장';
            else if (distToLake < 9) locationDesc = '호수 부둣가 근처';
            else if (p.position.y > 3) locationDesc = '북동쪽 높은 언덕';

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isMe
                    ? 'bg-blue-950/40 border-blue-800/60'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{p.nickname}</span>
                      {isMe && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{locationDesc}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">
                    {isMe ? '현재 위치' : `${dist.toFixed(1)}m 거리`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
