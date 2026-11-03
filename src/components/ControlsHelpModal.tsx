import React from 'react';
import { X, Keyboard, Mouse, Smartphone, MessageSquare, Compass } from 'lucide-react';

interface ControlsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 md:p-6 text-white max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h2 className="text-base md:text-lg font-bold text-white">메타월드 조작 방법</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Mobile Touch Guide */}
          <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>📱 스마트폰 / 태블릿 터치 조작</span>
            </div>
            <div className="text-slate-300 space-y-1 pl-6">
              <div>• <strong>좌측 가상 조이스틱</strong>: 360° 방향 캐릭터 걷기/달리기</div>
              <div>• <strong>우측 JUMP 버튼</strong>: 점프</div>
              <div>• <strong>화면 빈 곳 1손가락 드래그</strong>: 카메라 시점 회전</div>
              <div>• <strong>화면 2손가락 핀치</strong>: 줌인 / 줌아웃</div>
              <div>• <strong>우측 상단 [채팅] 버튼</strong>: 실시간 채팅창 열기</div>
            </div>
          </div>

          {/* PC Keyboard Guide */}
          <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 mb-1">💻 PC 키보드 이동</div>
              <div className="text-slate-400 space-y-1">
                <div><code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">W / S</code> : 앞 / 뒤 이동</div>
                <div><code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">A / D</code> : 좌 / 우 이동</div>
                <div><code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">Space</code> : 점프</div>
              </div>
            </div>
          </div>

          {/* Mouse Guide */}
          <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Mouse className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 mb-1">🖱️ PC 마우스 시점</div>
              <div className="text-slate-400 space-y-1">
                <div>• 마우스 드래그로 360° 시점 회전</div>
                <div>• 마우스 휠 스크롤로 줌인 / 줌아웃</div>
              </div>
            </div>
          </div>

          {/* Emotes & Wardrobe Guide */}
          <div className="flex items-start gap-3 p-3 bg-amber-950/30 rounded-xl border border-amber-800/40">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <span className="text-base">✨</span>
            </div>
            <div>
              <div className="font-semibold text-slate-200 mb-1">캐릭터 감정표현 & 옷장 커스텀</div>
              <div className="text-slate-400 space-y-1">
                <div>• <code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">1</code> 인사(Wave), <code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">2</code> 댄스(Dance), <code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">3</code> 경례(Salute), <code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">4</code> 환호(Cheer), <code className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded font-mono">5</code> 박수(Clap)</div>
                <div>• 화면 하단 감정표현 툴바의 <strong>[옷장]</strong> 버튼을 누르면 언제든지 사파리 모자, 동물 귀, 날개, 의상 및 색상을 실시간 변경할 수 있습니다.</div>
              </div>
            </div>
          </div>

          {/* Chat Guide */}
          <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 mb-0.5">실시간 멀티플레이 대화</div>
              <div className="text-slate-400">
                <code className="bg-slate-700 text-purple-300 px-1 py-0.5 rounded font-mono">Enter</code> 키 또는 모바일 [채팅] 버튼을 누르면 메시지를 보낼 수 있으며, 캐릭터 머리 위 3D 말풍선과 전체 채팅창에 실시간으로 전달됩니다.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
