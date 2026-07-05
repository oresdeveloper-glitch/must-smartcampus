import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { ArrowLeft, Send, Paperclip, Mic, MoreVertical, Phone, Video, CheckCheck } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500',
  'bg-purple-500', 'bg-teal-500', 'bg-cyan-500', 'bg-rose-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatBubbleTime(date: Date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ChatDetailScreen() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chats, chatMessages, sendMessage, user } = useApp();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const chat = chats.find(c => c.id === chatId);
  const messages = chatMessages[chatId || ''] || [];
  const basePath = `/${user?.role || 'student'}`;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;
    sendMessage(chatId, message.trim());
    setMessage('');
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && chatId) sendMessage(chatId, file.name, 'file');
    if (e.target) e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        if (chatId) sendMessage(chatId, 'Voice message', 'voice');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setTimeout(() => { if (recorder.state === 'recording') { recorder.stop(); setIsRecording(false); } }, 10000);
    } catch { alert('Microphone access denied or not available.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!chat) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 font-medium">Chat not found</p>
        <button onClick={() => navigate(`${basePath}/chat`)} className="mt-4 text-[#075E54] font-semibold hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto relative">
      {/* WhatsApp-style Header */}
      <div className="bg-[#075E54] dark:bg-[#0b3d36] px-3 py-2 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(`${basePath}/chat`)} className="p-1 rounded-full hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0', chat.type === 'group' ? 'bg-white/20' : avatarColor(chat.name))}>
          {chat.type === 'group' ? chat.name.charAt(0).toUpperCase() : chat.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{chat.name}</p>
          <p className="text-[11px] text-white/70">{chat.type === 'group' ? `${(chat.participants?.length || 0) + (user && !chat.participants?.includes(user.id) ? 1 : 0)} participants` : chat.isOnline ? 'online' : 'offline'}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { const r = confirm(`Start audio call with ${chat.name}?`); if (r) { const name = chat.name.replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c]||c)); const w = window.open('', '_blank', 'width=400,height=600'); if (w) { w.document.write(`<html><body style="display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;background:#075E54;color:white;padding:20px"><div style="font-size:64px;margin-bottom:16px">📞</div><h2 style="margin:0">${name}</h2><p style="color:rgba(255,255,255,.6);margin:8px 0 24px">Audio call</p><button onclick="window.close()" style="padding:12px 48px;background:#ef4444;color:white;border:none;border-radius:24px;font-size:16px;cursor:pointer">End Call</button></div></body></html>`); w.document.close(); } } }} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
            <Phone className="w-[18px] h-[18px]" />
          </button>
          <button onClick={() => { const r = confirm(`Start video call with ${chat.name}?`); if (r) { const name = chat.name.replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c]||c)); const w = window.open('', '_blank', 'width=800,height=600'); if (w) { w.document.write(`<html><body style="display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;background:#075E54;color:white;padding:20px"><div style="font-size:64px;margin-bottom:16px">📹</div><h2 style="margin:0">${name}</h2><p style="color:rgba(255,255,255,.6);margin:8px 0 24px">Video call</p><button onclick="window.close()" style="padding:12px 48px;background:#ef4444;color:white;border:none;border-radius:24px;font-size:16px;cursor:pointer">End Call</button></div></body></html>`); w.document.close(); } } }} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
            <Video className="w-[18px] h-[18px]" />
          </button>
          <button onClick={() => { const action = prompt('1. Clear chat\n2. Add participants\n3. Mute notifications'); if (action === '1') confirm('Clear all messages?'); else if (action === '2') { const name = prompt('Participant name:'); if (name) alert(`${name} added.`); } else if (action === '3') alert('Chat muted.'); }} className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors">
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Messages — WhatsApp-style background + bubbles */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
        style={{
          backgroundColor: '#e5ddd5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5 L35 12 L25 12 Z\' fill=\'%23ffffff\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <svg className="w-8 h-8 text-[#075E54]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p>No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">Say hello! 👋</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSystem = msg.senderId === 'system';
            const isMine = msg.senderId === user?.id;
            const showAvatar = i === 0 || messages[i - 1]?.senderId !== msg.senderId;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <div className="bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 text-[11px] px-3 py-1.5 rounded-full shadow-sm max-w-[75%] text-center">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div className={cn('flex gap-1.5 max-w-[80%]', isMine ? 'flex-row-reverse' : 'flex-row')}>
                  {/* Avatar column */}
                  <div className="w-7 flex-shrink-0 self-end">
                    {!isMine && showAvatar && (
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold', avatarColor(msg.senderName))}>
                        {(msg.senderName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Bubble */}
                  <div>
                    {showAvatar && !isMine && (
                      <p className="text-[11px] text-[#075E54] dark:text-[#25D366] font-medium mb-0.5 ml-1">{msg.senderName}</p>
                    )}
                    <div className={cn(
                      'relative px-3 py-1.5 text-sm leading-relaxed shadow-sm',
                      isMine
                        ? 'bg-[#dcf8c6] dark:bg-[#1a4a3a] text-slate-900 dark:text-white rounded-lg rounded-br-sm'
                        : 'bg-white dark:bg-[#1e2a30] text-slate-900 dark:text-white rounded-lg rounded-bl-sm'
                    )}>
                      <p className="whitespace-pre-wrap break-words pr-[60px]">{msg.type === 'voice' ? '🎤 Voice message' : msg.type === 'file' ? '📎 ' + msg.content : msg.content}</p>
                      {/* Timestamp + status inside bubble */}
                      <div className={cn('absolute bottom-1 right-1.5 flex items-center gap-0.5', isMine ? '' : '')}>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatBubbleTime(msg.timestamp)}</span>
                        {isMine && (
                          <CheckCheck className={cn('w-3 h-3', msg.read ? 'text-blue-500' : 'text-slate-400')} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — WhatsApp-style */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2.5 bg-[#f0f0f0] dark:bg-[#1a262a] flex-shrink-0">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-[#2a3942] border-0 text-slate-900 dark:text-white text-sm outline-none"
        />
        {message.trim() ? (
          <button type="submit" className="p-2 rounded-full bg-[#075E54] dark:bg-[#25D366] text-white hover:opacity-90 transition-all flex-shrink-0 shadow-sm">
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button type="button" onClick={isRecording ? stopRecording : startRecording} className={cn('p-2 rounded-full transition-all flex-shrink-0', isRecording ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400')}>
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}
