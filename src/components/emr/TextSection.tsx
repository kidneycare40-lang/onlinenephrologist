'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pen, Mic, LayoutTemplate, Undo2, Bold, Italic, Underline, X, MicOff, ChevronDown, ChevronRight } from 'lucide-react';

interface TextSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showIcons?: boolean;
  defaultCollapsed?: boolean;
  onMicClick?: () => void;
  onTemplateClick?: () => void;
  onUndoClick?: () => void;
  templates?: TemplateOption[];
}

export interface TemplateOption {
  label: string;
  content: string;
}

const defaultTemplates: TemplateOption[] = [
  { label: 'Chief Complaint', content: 'Patient presents with...\nDuration: \nOnset: \nSeverity: ' },
  { label: 'History of Present Illness', content: 'History of Present Illness:\n- Duration of symptoms: \n- Progression: \n- Associated symptoms: \n- Relieving factors: \n- Aggravating factors: ' },
  { label: 'Past Medical History', content: 'Past Medical History:\n- Hypertension: \n- Diabetes: \n- CKD Stage: \n- Previous surgeries: \n- Blood transfusions: ' },
  { label: 'Family History', content: 'Family History:\n- Father: \n- Mother: \n- Siblings: \n- Known hereditary conditions: ' },
  { label: 'Drug History', content: 'Current Medications:\n1. \n2. \n3. \nAllergies: \nPrevious medications tried: ' },
  { label: 'Examination Findings', content: 'General Examination:\n- built: \n- nourishment: \n- pallor: \n- icterus: \n- cyanosis: \n- edema: \n- lymph nodes: \n\nVitals: BP: / mmHg, Pulse: /min, Temp: °C, SpO2: %' },
  { label: 'CKD Assessment', content: 'CKD Assessment:\n- Current stage: \n- eGFR: mL/min/1.73m²\n- Creatinine: mg/dL\n- BUN: mg/dL\n- Urine output: \n- Fluid status: \n- Electrolytes: K+ , Na+ , Phosphorus: , Calcium: ' },
  { label: 'Dialysis Notes', content: 'Dialysis Session:\n- Type: HD/PD\n- Access: AVF/AVG/Catheter\n- Flow rate: mL/min\n- Duration: hours\n- Ultrafiltration: mL\n- Complications: ' },
];

export default function TextSection({
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  rows = 4,
  className,
  showIcons = true,
  defaultCollapsed = false,
  templates = defaultTemplates,
}: TextSectionProps) {
  const [showFormatting, setShowFormatting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Track history for undo
  const lastTrackedRef = useRef<string>('');
  useEffect(() => {
    if (value && value !== lastTrackedRef.current) {
      lastTrackedRef.current = value;
      setHistory(prev => {
        if (prev.length === 0 || prev[prev.length - 1] !== value) {
          const next = [...prev, value];
          return next.length > 50 ? next.slice(-50) : next;
        }
        return prev;
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [value]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevValue = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prevValue);
    }
  }, [history, historyIndex, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextValue = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(nextValue);
    }
  }, [history, historyIndex, onChange]);

  // Voice input using Web Speech API
  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      let hasFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) hasFinal = true;
      }
      if (hasFinal) {
        onChange(value + transcript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, value, onChange]);

  // Formatting helpers
  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  return (
    <>
      <div className={cn('bg-white border border-slate-200 rounded-lg', className)}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#0A75BB] transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {label}
          </button>
          {!collapsed && showIcons && (
            <div className="flex items-center gap-0.5">
              {/* Formatting toggle */}
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  showFormatting
                    ? 'text-[#0A75BB] bg-[#0A75BB]/10'
                    : 'text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100'
                )}
                title="Text formatting"
              >
                <Pen className="h-3.5 w-3.5" />
              </button>

              {/* Voice input */}
              <button
                onClick={toggleVoiceInput}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  isRecording
                    ? 'text-red-500 bg-red-50 animate-pulse'
                    : 'text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100'
                )}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>

              {/* Templates */}
              <button
                onClick={() => setShowTemplateModal(true)}
                className="p-1.5 text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100 rounded transition-colors"
                title="Insert template"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
              </button>

              {/* Undo/Redo */}
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Formatting toolbar */}
            {showFormatting && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                <button
                  onClick={() => wrapSelection('**', '**')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => wrapSelection('_', '_')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => wrapSelection('__', '__')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  title="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <button
                  onClick={() => insertAtCursor('\n- ')}
                  className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors font-medium"
                >
                  Bullet
                </button>
                <button
                  onClick={() => insertAtCursor('\n1. ')}
                  className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors font-medium"
                >
                  Number
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = t.scrollHeight + 'px';
                }}
                onBlur={onBlur}
                rows={rows}
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-y"
                placeholder={placeholder}
                style={{ minHeight: `${rows * 1.5}rem` }}
              />
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-medium text-red-600">Listening...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Insert Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              {templates.map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => {
                    insertAtCursor(tpl.content);
                    setShowTemplateModal(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">{tpl.label}</span>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tpl.content.substring(0, 60)}...</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
