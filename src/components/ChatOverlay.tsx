import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ChatMessage } from '../types/game.ts';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  selfNickname: string;
  isChatFocused: boolean;
  setIsChatFocused: (focused: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  onSendMessage,
  selfNickname,
  isChatFocused,
  setIsChatFocused,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
}) => {
  const [inputText, setInputText] = useState('');
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMobileDrawerOpen]);

  // Focus input when parent triggers focus
  useEffect(() => {
    if (isChatFocused) {
      inputRef.current?.focus();
    }
  }, [isChatFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    inputRef.current?.blur();
    setIsChatFocused(false);
  };

  const handleQuickEmoji = (emoji: string) => {
    onSendMessage(emoji);
  };

  return (
    <>
      {/* 1. Mobile Full Bottom Sheet Drawer (Only visible on mobile when open) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150">
          <div className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white">월드 실시간 채팅</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs max-h-56">
              {messages.map((msg) => {
                const isSystem = msg.playerId === 'system';
                const isMe = msg.nickname === selfNickname;

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center py-0.5 text-[11px] text-slate-400 font-mono">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex flex-col gap-0.5 leading-relaxed">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[11px]" style={{ color: msg.color }}>
                        {msg.nickname}
                        {isMe && <span className="text-[10px] text-slate-400 font-normal"> (나)</span>}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-slate-800/80 text-slate-100 rounded-xl px-3 py-1.5 max-w-[90%] break-words self-start border border-slate-700/50">
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reaction Pills */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 border-t border-slate-800 overflow-x-auto custom-scrollbar">
              {['👋 안녕!', '🔥 모닥불', '🌲 자연 좋다', '✨ 최고', '🏃 같이 가요'].map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  onClick={() => handleQuickEmoji(reaction)}
                  className="px-2.5 py-1 bg-slate-700/80 text-slate-200 rounded-lg text-xs whitespace-nowrap active:scale-95"
                >
                  {reaction}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-slate-950 flex items-center gap-2 border-t border-slate-800">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 150))}
                onFocus={() => setIsChatFocused(true)}
                onBlur={() => setIsChatFocused(false)}
                placeholder="메시지 입력..."
                maxLength={150}
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="min-w-[44px] min-h-[44px] px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Desktop Floating Chat Overlay (Visible on md: and above) */}
      <div className="hidden md:flex fixed bottom-6 left-6 z-30 w-80 lg:w-96 flex-col font-sans transition-all duration-200">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-t border-x border-slate-700/80 rounded-t-xl text-xs text-slate-300">
          <div className="flex items-center gap-2 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>월드 실시간 채팅</span>
          </div>
          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            title={isDesktopCollapsed ? '채팅창 펼치기' : '채팅창 접기'}
          >
            {isDesktopCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {!isDesktopCollapsed && (
          <div className="bg-slate-900/80 border-b border-x border-slate-700/80 rounded-b-xl shadow-xl flex flex-col overflow-hidden">
            {/* Message List */}
            <div className="h-44 overflow-y-auto p-3 space-y-2 custom-scrollbar text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  메시지가 없습니다. 대화를 시작해보세요!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSystem = msg.playerId === 'system';
                  const isMe = msg.nickname === selfNickname;

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-0.5 text-[11px] text-slate-400 font-mono">
                        {msg.text}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex flex-col gap-0.5 leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-[11px] drop-shadow-sm"
                          style={{ color: msg.color }}
                        >
                          {msg.nickname}
                          {isMe && <span className="text-[10px] text-slate-400 font-normal"> (나)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-slate-800/70 text-slate-100 rounded-lg px-2.5 py-1.5 max-w-[95%] break-words self-start border border-slate-700/40">
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reaction Buttons */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/50 border-t border-slate-700/40 text-xs">
              <span className="text-[10px] text-slate-400 mr-1">빠른 반응:</span>
              {['👋 안녕!', '🔥 모닥불', '🌲 자연 좋다', '✨ 최고', '🏃 같이 가요'].map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  onClick={() => handleQuickEmoji(reaction)}
                  className="px-2 py-0.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors whitespace-nowrap"
                >
                  {reaction}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-2 bg-slate-900 flex items-center gap-1.5 border-t border-slate-700/60">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 150))}
                onFocus={() => setIsChatFocused(true)}
                onBlur={() => setIsChatFocused(false)}
                placeholder="메시지 입력 (Enter로 전송)..."
                maxLength={150}
                className="flex-1 bg-slate-800/90 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
