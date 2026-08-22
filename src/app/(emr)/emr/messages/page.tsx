'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, ChevronLeft, User, Paperclip, X, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface Conversation {
  id: string;
  patient_account_id: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count_doctor: number;
  patient_name: string;
  patient_email: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  read_at: string | null;
  attachments: { file_name: string; storage_path: string; file_type: string | null }[];
}

interface PendingFile {
  file: File;
  preview?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string | null) {
  if (type?.startsWith('image/')) return ImageIcon;
  return FileText;
}

export default function EMRMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadError, setUploadError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/emr/messages')
      .then(r => r.json())
      .then(d => { setConversations(d.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/emr/messages')
        .then(r => r.json())
        .then(d => { setConversations(d.conversations || []); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (conv: Conversation) => {
    setSelected(conv);
    const res = await fetch(`/api/emr/messages?conversationId=${conv.id}`);
    const data = await res.json();
    setMessages(data.messages || []);
    // Refresh conversation list to update unread counts
    const listRes = await fetch('/api/emr/messages');
    const listData = await listRes.json();
    setConversations(listData.conversations || []);
  };

  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      fetch(`/api/emr/messages?conversationId=${selected.id}`)
        .then(r => r.json())
        .then(d => { if (d.messages) setMessages(d.messages); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setUploadError('');
    const newPending: PendingFile[] = [];
    for (const f of Array.from(fileList)) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setUploadError(`"${f.name}" is not supported. Use PDF, JPG, PNG, or WebP.`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        setUploadError(`"${f.name}" exceeds 10 MB limit.`);
        continue;
      }
      if (pendingFiles.length + newPending.length >= 5) {
        setUploadError('Maximum 5 files per message.');
        break;
      }
      const pf: PendingFile = { file: f };
      if (f.type.startsWith('image/')) {
        pf.preview = URL.createObjectURL(f);
      }
      newPending.push(pf);
    }
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSend = async () => {
    const hasText = input.trim().length > 0;
    const hasFiles = pendingFiles.length > 0;
    if ((!hasText && !hasFiles) || !selected || sending) return;
    setSending(true);
    setUploadError('');

    try {
      let attachments: { file_name: string; storage_path: string; file_type: string; file_size: number }[] = [];

      if (hasFiles) {
        const fileData = await Promise.all(
          pendingFiles.map(pf =>
            new Promise<{ data: string; name: string; type: string }>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve({ data: reader.result as string, name: pf.file.name, type: pf.file.type });
              reader.readAsDataURL(pf.file);
            })
          )
        );
        const uploadRes = await fetch('/api/emr/messages/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: fileData }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setUploadError(uploadData.error || 'Upload failed');
          setSending(false);
          return;
        }
        attachments = uploadData.files || [];
      }

      const res = await fetch('/api/emr/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selected.id,
          message: input.trim() || (hasFiles ? `Sent ${pendingFiles.length} file(s)` : ''),
          attachments,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, { ...data.message, attachments: attachments || [] }]);
        }
        setInput('');
        pendingFiles.forEach(pf => { if (pf.preview) URL.revokeObjectURL(pf.preview); });
        setPendingFiles([]);
        const listRes = await fetch('/api/emr/messages');
        const listData = await listRes.json();
        setConversations(listData.conversations || []);
      }
    } catch {
      setUploadError('Failed to send. Please try again.');
    }
    setSending(false);
  };

  const filtered = conversations.filter(c =>
    !searchQuery || c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count_doctor || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Conversation List */}
      <div className={`w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 ${
        selected ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Messages
            {totalUnread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">
                {totalUnread}
              </span>
            )}
          </h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No conversations yet
            </div>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => loadMessages(c)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                  selected?.id === c.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0A75BB]/10 text-[#0A75BB] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {c.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 truncate">{c.patient_name}</span>
                      {c.unread_count_doctor > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded-full shrink-0">
                          {c.unread_count_doctor}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.last_message_preview || 'No messages yet'}</p>
                    {c.last_message_at && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(c.last_message_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${
        selected ? 'flex' : 'hidden lg:flex'
      }`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="lg:hidden p-1 text-gray-500">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-9 h-9 bg-[#0A75BB]/10 text-[#0A75BB] rounded-full flex items-center justify-center font-bold text-sm">
                {selected.patient_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selected.patient_name}</p>
                <p className="text-xs text-gray-500">{selected.patient_email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isPatient = msg.sender_type === 'patient';
                return (
                  <div key={msg.id} className={`flex ${isPatient ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isPatient
                        ? 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
                        : 'bg-[#0A75BB] text-white rounded-br-md'
                    }`}>
                      {isPatient && (
                        <p className="text-[10px] font-semibold text-[#0A75BB] mb-1">{selected.patient_name}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {msg.attachments.map((att, i) => {
                            const Icon = getFileIcon(att.file_type);
                            return (
                              <a key={i} href={`/api/attachment?path=${encodeURIComponent(att.storage_path)}`}
                                target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                                  isPatient
                                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}>
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate flex-1">{att.file_name}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1.5 ${isPatient ? 'text-gray-400' : 'text-blue-200'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-3">
              {uploadError && (
                <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}
              {pendingFiles.length > 0 && (
                <div className="mb-2 flex gap-2 flex-wrap">
                  {pendingFiles.map((pf, i) => (
                    <div key={i} className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                      {pf.preview ? (
                        <img src={pf.preview} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-700 truncate max-w-[120px]">{pf.file.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(pf.file.size)}</p>
                      </div>
                      <button onClick={() => removePendingFile(i)}
                        className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" className="hidden" multiple
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-gray-400 hover:text-[#0A75BB] hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                  title="Attach file">
                  <Paperclip className="h-4 w-4" />
                </button>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && pendingFiles.length === 0) || sending}
                  className="p-2.5 bg-[#0A75BB] text-white rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
