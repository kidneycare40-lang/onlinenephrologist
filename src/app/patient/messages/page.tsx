'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, AlertTriangle, Shield, X, FileText, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string | null) {
  if (type?.startsWith('image/')) return ImageIcon;
  return FileText;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadError, setUploadError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetch('/api/patient-auth/messages')
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/patient-auth/messages')
        .then(r => r.json())
        .then(d => {
          setMessages(prev => {
            const newMsgs = d.messages || [];
            if (newMsgs.length > prev.length) {
              setTimeout(scrollToBottom, 100);
            }
            return newMsgs;
          });
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if ((!hasText && !hasFiles) || sending) return;
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

        const uploadRes = await fetch('/api/patient-auth/messages/upload', {
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

      const res = await fetch('/api/patient-auth/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      }
    } catch {
      setUploadError('Failed to send. Please try again.');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 p-4">
        <h1 className="text-lg font-bold text-gray-900">Secure Messages</h1>
        <p className="text-xs text-gray-500">Message Dr. Rajesh Goel &amp; team directly</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-4 mb-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700">
          Messages are for non-emergency communication and routine follow-up only.
          If you have a medical emergency, seek immediate emergency medical care.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-100 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#0A75BB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-[#0A75BB]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Start a Conversation</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Ask questions about your treatment, share reports for review,
              or get guidance on your kidney health.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isPatient = msg.sender_type === 'patient';
          return (
            <div key={msg.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isPatient
                  ? 'bg-[#0A75BB] text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                {!isPatient && (
                  <p className="text-[10px] font-semibold text-[#0A75BB] mb-1">Dr. Rajesh Goel</p>
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
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate flex-1">{att.file_name}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
                <p className={`text-[10px] mt-1.5 ${isPatient ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 p-3">
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
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!input.trim() && pendingFiles.length === 0) || sending}
            className="p-2.5 bg-[#0A75BB] text-white rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 shrink-0"
          >
            {sending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
