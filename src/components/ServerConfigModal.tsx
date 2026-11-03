import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { networkManager } from '../game/network.ts';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  isOpen,
  onClose,
  isConnected,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(networkManager.getServerUrl());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    networkManager.setCustomServerUrl(urlInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setUrlInput('');
    networkManager.setCustomServerUrl('');
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">게임 서버 (Socket.IO) 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="mb-4 p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center justify-between">
          <div className="text-xs">
            <div className="text-slate-400 mb-0.5">현재 소켓 연결 상태:</div>
            <div className="font-mono text-slate-200 truncate max-w-[220px]">
              {networkManager.currentServerUrl || window.location.origin}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">연결됨</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">연결 대기중</span>
              </>
            )}
          </div>
        </div>

        {/* Notice for Vercel users */}
        <div className="mb-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200/90 leading-relaxed space-y-1">
          <div className="font-semibold text-blue-300">💡 Vercel 배포 시 다른 유저가 안 보일 때:</div>
          <div>
            Vercel은 서버리스이므로 Render에 배포한 실시간 게임 서버 주소(예: <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono">https://xxxx.onrender.com</code>)를 아래 입력창에 넣으시면 즉시 연동됩니다!
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              실시간 백엔드 서버 URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="예: https://meta-world-server.onrender.com"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          {isSaved && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>설정이 저장되었습니다. 서버에 다시 연결합니다...</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              저장 및 재연결
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
              title="기본값(현재 사이트 주소)으로 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>기본값</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
