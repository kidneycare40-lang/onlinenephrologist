'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Mic, MicOff, Sparkles, FileText, Pill, Search,
  AlertTriangle, TestTube, UserPlus, ClipboardList, Copy, Check,
  ChevronRight, Activity, Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MessageRole = 'user' | 'assistant';
type ToolId = 'voice' | 'soap' | 'prescription' | 'icd10' | 'drug' | 'lab' | 'referral' | 'discharge';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

interface AITool {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const aiTools: AITool[] = [
  { id: 'voice', title: 'Voice → Clinical Notes', description: 'Convert voice dictation to clinical notes', icon: <Mic className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'soap', title: 'SOAP Generator', description: 'Generate formatted SOAP notes', icon: <FileText className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'prescription', title: 'Prescription Suggest', description: 'Suggest medications based on diagnosis', icon: <Pill className="h-5 w-5" />, color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'icd10', title: 'ICD-10 Finder', description: 'Find matching ICD-10 codes', icon: <Search className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'drug', title: 'Drug Interaction Checker', description: 'Check drug-drug interactions', icon: <AlertTriangle className="h-5 w-5" />, color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 'lab', title: 'Lab Trend Summary', description: 'AI analysis of lab trends', icon: <TestTube className="h-5 w-5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 'referral', title: 'Referral Letter', description: 'Auto-generate referral letters', icon: <UserPlus className="h-5 w-5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'discharge', title: 'Discharge Summary', description: 'Auto-generate discharge summaries', icon: <ClipboardList className="h-5 w-5" />, color: 'bg-teal-50 text-teal-600 border-teal-200' },
];

const quickPrompts = ['Generate SOAP', 'Suggest Rx', 'ICD-10', 'Drug Interactions', 'Patient Summary'];

const sampleConversation: ChatMessage[] = [
  {
    id: 'msg-1', role: 'user',
    content: 'Patient is a 58-year-old male with CKD Stage 5, creatinine 8.2, eGFR 7. On maintenance hemodialysis 3x/week. Suboptimal dialysis adequacy.',
    timestamp: '09:15',
  },
  {
    id: 'msg-2', role: 'assistant',
    content: `**Assessment**: CKD Stage 5 (N18.5) on maintenance hemodialysis with suboptimal dialysis adequacy (Kt/V 1.1).

**Recommended Actions**:
- Increase blood flow rate to 300 mL/min or extend session by 30 min
- Review vascular access function (AV fistula thrill)
- Repeat Kt/V after session modification

**Investigations**:
- CBC with differential
- Serum Electrolytes (Na, K, Cl, HCO3)
- Calcium, Phosphorus, Intact PTH
- Iron Studies, Ferritin
- Serum Albumin
- HbA1c

**Medications to optimize**:
1. Tab. Telmesartan 40mg OD (morning)
2. Tab. Amlodipine 5mg OD
3. Inj. Epoetin Alfa 4000 IU TIW (SC after dialysis)
4. Tab. Sevelamer 800mg TID (with meals)
5. Tab. Calcium Carbonate 500mg BD

**Follow-up**: 1 week with repeat Kt/V and electrolytes`,
    timestamp: '09:16',
  },
  {
    id: 'msg-3', role: 'user',
    content: 'Also has uncontrolled diabetes, HbA1c 7.8%. BP uncontrolled at 160/90 pre-dialysis.',
    timestamp: '09:20',
  },
  {
    id: 'msg-4', role: 'assistant',
    content: `**Updated Assessment**:
1. CKD Stage 5 on MHD — suboptimal adequacy
2. Uncontrolled Type 2 DM (E11.65) — HbA1c 7.8%
3. Uncontrolled Hypertension (I10) — pre-dialysis 160/90

**Medication Adjustments**:
1. **Increase** Telmesartan to 80mg OD (if tolerated, monitor K+)
2. **Add** Insulin Glargine 10 units OD at bedtime for diabetes
3. **Hold** Metformin if still on it (contraindicated in CKD 5)
4. **Continue** Amlodipine 5mg OD — consider adding if BP still uncontrolled

**Monitoring**:
- Daily fasting glucose + bedtime glucose
- Pre-dialysis BP at each session
- Serum K+ before next dialysis (risk of hyperkalemia with Telmesartan dose increase)

**Targets**:
- HbA1c <7.5% (relaxed target for CKD 5)
- Pre-dialysis BP <140/90
- Kt/V >1.4`,
    timestamp: '09:21',
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleConversation);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`, role: 'user', content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`, role: 'assistant', content: generateMockResponse(inputValue),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1800);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 lg:gap-6">
      <div className="flex-1 lg:w-[70%] flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="p-2 bg-[#0A75BB] rounded-xl">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Clinical Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3 max-w-[85%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-[#0A75BB]" />
                </div>
              )}
              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-[#0A75BB] text-white rounded-br-md'
                  : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-bl-md'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="space-y-2">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**'))
                        return <p key={i} className="font-semibold text-gray-900 mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('- '))
                        return <p key={i} className="pl-4 text-gray-700">{'\u2022'} {line.slice(2)}</p>;
                      if (/^\d+\./.test(line))
                        return <p key={i} className="pl-4 text-gray-700">{line}</p>;
                      return line ? <p key={i} className="text-gray-700">{line}</p> : <br key={i} />;
                    })}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                <div className={cn('flex items-center gap-2 mt-2', msg.role === 'user' ? 'justify-end' : '')}>
                  <span className={cn('text-[10px]', msg.role === 'user' ? 'text-blue-200' : 'text-gray-400')}>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button onClick={() => copyToClipboard(msg.content, msg.id)}
                      className={cn('p-1 rounded-md transition-colors', copiedId === msg.id ? 'text-green-500' : 'text-gray-400 hover:text-gray-600')}>
                      {copiedId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-[#0A75BB]" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#0A75BB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#0A75BB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#0A75BB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt) => (
              <button key={prompt} onClick={() => setInputValue(prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A75BB]/5 text-[#0A75BB] text-xs font-medium rounded-full border border-[#0A75BB]/20 hover:bg-[#0A75BB]/10 transition-colors whitespace-nowrap shrink-0">
                <Sparkles className="h-3 w-3" />
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2">
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask the AI assistant anything..." rows={1}
              className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none min-h-[40px] max-h-[120px]" />
            <button onClick={() => setIsRecording(!isRecording)}
              className={cn('p-2.5 rounded-xl transition-colors', isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500 hover:bg-gray-300')}>
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button onClick={handleSend} disabled={!inputValue.trim()}
              className="p-2.5 bg-[#0A75BB] text-white rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[30%] flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">AI Tools</h3>
          <p className="text-xs text-gray-500 mt-0.5">Quick access to AI-powered tools</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {aiTools.map((tool) => (
            <button key={tool.id} onClick={() => setInputValue(`[${tool.title}] `)}
              className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg border shrink-0', tool.color)}>{tool.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{tool.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Activity className="h-3.5 w-3.5 text-green-500" />
            <span>AI Model: GPT-4 Medical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('soap') || lower.includes('notes'))
    return `**SOAP Note Generated**\n\n**Subjective**: Patient presents with chief complaint as described. History reviewed.\n\n**Objective**:\n- Vitals: BP 140/90, HR 82, Temp 98.4°F\n- General: Alert, oriented, mild distress\n\n**Assessment**: Primary diagnosis with ICD code\n\n**Plan**: Investigations ordered, medications prescribed, follow-up in 2 weeks`;
  if (lower.includes('prescription') || lower.includes('rx'))
    return `**Suggested Prescription**\n\n1. Tab. Amlodipine 5mg - 1 OD x 30 days\n2. Tab. Ramipril 5mg - 1 OD x 30 days\n3. Tab. Erythropoietin 4000 IU TIW x 4 weeks\n\n*Verify allergies and adjust for renal function.*`;
  if (lower.includes('icd'))
    return `**ICD-10 Codes**\n\n1. N18.5 - CKD Stage 5\n2. I10 - Essential Hypertension\n3. E11.65 - Type 2 DM with Hyperglycemia\n4. Z99.2 - Dependence on Renal Dialysis`;
  if (lower.includes('drug') || lower.includes('interaction'))
    return `**Drug Interactions**\n\n1. Ramipril + NSAIDs: Reduced efficacy, nephrotoxic risk (Moderate)\n2. Metformin + Contrast: Lactic acidosis risk (High) - Hold 48hr before/after\n3. Aspirin + Ramipril: Mild reduction in ACE inhibitor efficacy`;
  return `Based on the clinical information, here is my analysis:\n\n**Assessment**: The presentation is consistent with the noted conditions.\n\n**Recommended Actions**:\n1. Complete relevant investigations\n2. Review current medications\n3. Consider specialist referral\n4. Follow-up in 2-4 weeks\n\n*AI-generated suggestion — please review with clinical judgment.*`;
}
