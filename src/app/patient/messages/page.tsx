'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, AlertTriangle, Shield } from 'lucide-react';

interface Message {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  read_at: string | null;
  attachments: { file_name: string; storage_path: string; file_type: string | null }[];
}

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/patient-auth/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, { ...data.message, attachments: [] }]);
        }
        setInput('');
      }
    } catch {}
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
      {/* Header */}
      <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 p-4">
        <h1 className="text-lg font-bold text-gray-900">Secure Messages</h1>
        <p className="text-xs text-gray-500">Message Dr. Rajesh Goel &amp; team directly</p>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mx-4 mb-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700">
          Messages are for non-emergency communication and routine follow-up only.
          If you have a medical emergency, seek immediate emergency medical care.
        </p>
      </div>

      {/* Messages */}
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
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${isPatient ? 'text-blue-100' : 'text-gray-500'}`}>
                        <Paperclip className="h-3 w-3" />
                        <a href={`/api/attachment?path=${encodeURIComponent(att.storage_path)}`} target="_blank" rel="noopener noreferrer"
                          className={isPatient ? 'hover:underline text-blue-100' : 'hover:underline text-[#0A75BB]'}>
                          {att.file_name}
                        </a>
                      </div>
                    ))}
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

      {/* Input */}
      <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 p-3">
        <div className="flex items-end gap-2">
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
            disabled={!input.trim() || sending}
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
