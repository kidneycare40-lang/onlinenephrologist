'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Loader2, Check, AlertCircle, X, Sparkles, ClipboardPaste, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { processUploadedFiles, type OCRResult, type ExtractedLabValue, type ExtractedMedicine } from '@/lib/ocr-utils';

interface ReportUploadOCRProps {
  onApplyLabValues: (values: ExtractedLabValue[]) => void;
  onApplyVitals: (vitals: OCRResult['vitals']) => void;
  onApplyDiagnoses: (diagnoses: string[]) => void;
  onApplyMedicines: (medicines: string[]) => void;
  onApplyStructuredMedicines: (medicines: ExtractedMedicine[]) => void;
  onApplyComplaints: (complaints: string[]) => void;
}

export default function ReportUploadOCR({
  onApplyLabValues,
  onApplyVitals,
  onApplyDiagnoses,
  onApplyMedicines,
  onApplyStructuredMedicines,
  onApplyComplaints,
}: ReportUploadOCRProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parsedMeds, setParsedMeds] = useState<ExtractedMedicine[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
    setAppliedFields(new Set());
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
    setAppliedFields(new Set());
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
    setAppliedFields(new Set());
  };

  const runOCR = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError('');
    try {
      const ocrResult = await processUploadedFiles(files);
      setResult(ocrResult);
    } catch (err) {
      setError('Failed to process files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const markApplied = (field: string) => {
    setAppliedFields((prev) => new Set(prev).add(field));
  };

  const parsePasteText = useCallback(() => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
    const meds: ExtractedMedicine[] = [];

    const extractWhen = (text: string): string => {
      const t = text.toLowerCase();
      if (t.includes('before food') || t.includes('before meal') || t.includes('empty stomach') || t.includes(' on empty stomach') || t.match(/\bac\b/)) return 'before food';
      if (t.includes('after food') || t.includes('after meal') || t.includes('with food') || t.match(/\bpc\b/)) return 'after food';
      if (t.includes('bed time') || t.includes('bedtime') || t.includes('at bedtime')) return 'bed time';
      return '';
    };

    const extractDuration = (text: string): string => {
      const m = text.match(/(\d+)\s*(days?|weeks?|months?|years?)\b/i);
      return m ? `${m[1]} ${m[2].replace(/s$/, '')}` : '';
    };

    const extractDosageCount = (text: string): string => {
      const m = text.match(/(\d+)\s*(tablet|cap|capsule|tab|injection|syrup|scoop|ml|drop)s?\b/i);
      return m ? `${m[1]} ${m[2].toLowerCase().replace(/s$/, '')}` : '';
    };

    const extractFrequency = (text: string): string => {
      const t = text.toLowerCase();
      if (t.match(/\b1-1-1\b/) || t.includes('3 times') || t.includes('tid')) return '1-1-1';
      if (t.match(/\b1-1-0\b/) || (t.includes('2 times') && t.includes('morning') && t.includes('afternoon'))) return '1-1-0';
      if (t.match(/\b1-0-1\b/) || (t.includes('2 times') && t.includes('morning') && t.includes('evening'))) return '1-0-1';
      if (t.match(/\b0-1-1\b/) || (t.includes('2 times') && t.includes('afternoon') && t.includes('evening'))) return '0-1-1';
      if (t.match(/\b0-0-1\b/) || t.includes('once at night') || t.includes('at night')) return '0-0-1';
      if (t.match(/\b1-0-0\b/) || t.includes('once in morning')) return '1-0-0';
      if (t.match(/\b0-1-0\b/)) return '0-1-0';
      if (t.includes('once daily') || t.includes('once a day') || t.includes('1 time') || t.includes('once') || t.match(/\bqd\b/)) return '1-0-0';
      if (t.includes('twice daily') || t.includes('twice a day') || t.includes('2 times') || t.match(/\bbid\b/)) return '1-0-1';
      if (t.includes('thrice daily') || t.includes('3 times') || t.match(/\btid\b/)) return '1-1-1';
      if (t.includes('alternate day') || t.includes('every other day')) return 'alternate day';
      if (t.includes('once weekly') || t.includes('once a week')) return 'once weekly';
      if (t.includes('twice weekly') || t.includes('twice a week')) return 'twice weekly';
      if (t.includes('sos') || t.includes('as needed')) return 'SOS';
      if (t.includes('stat')) return 'STAT';
      return '';
    };

    const normalizeStrength = (raw: string): string => {
      let s = raw.trim();
      if (s.match(/^\d+$/) && !s.includes(' ')) return s;
      s = s.replace(/\s+/g, '').toLowerCase();
      return s;
    };

    for (const line of lines) {
      if (line.toLowerCase().startsWith('medicine') || line.toLowerCase().startsWith('rx') || line.toLowerCase().startsWith('drug')) continue;
      if (line.toLowerCase().includes('signature') || line.toLowerCase().includes('doctor') || line.toLowerCase().includes('note:')) break;

      let parts = line.split(/\t+/);
      if (parts.length < 2) parts = line.split(/\s{2,}/);
      if (parts.length < 2) parts = line.split(/\s*\|\s*/);
      if (parts.length < 2) parts = line.split(/\s*-\s*(?=before food|after food|empty stomach|bed ?time|once|twice|thrice|\d+\s*(?:times|tablet|cap|tab|month|week|day|year)|\d+-\d+-\d+)/i);
      if (parts.length < 2) {
        const commaParts = line.split(/\s*,\s*/);
        if (commaParts.length >= 3) parts = commaParts;
      }

      let name = '', dosage = '', strength = '', frequency = '', duration = '', instructions = '', when = '';

      if (parts.length >= 5) {
        const rxIdx = parts[0]?.match(/^\d+$/) ? 0 : -1;
        name = parts[rxIdx === 0 ? 1 : 0] || '';
        dosage = parts[rxIdx === 0 ? 2 : 1] || '';
        frequency = parts[rxIdx === 0 ? 3 : 2] || '';
        instructions = parts[rxIdx === 0 ? 4 : 3] || '';
        duration = parts[rxIdx === 0 ? 5 : 4] || parts[parts.length - 1] || '';
      } else if (parts.length >= 3) {
        name = parts[0] || '';
        dosage = parts[1] || '';
        frequency = parts[2] || '';
        duration = parts.length > 3 ? parts[3] : '';
        instructions = parts.length > 4 ? parts[4] : '';
      } else if (parts.length === 2) {
        name = parts[0] || '';
        frequency = parts[1] || '';
      } else if (parts.length === 1 && parts[0]) {
        let remaining = parts[0].trim();

        const strengthM = remaining.match(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b)/i);
        if (strengthM) {
          const idx = remaining.toLowerCase().indexOf(strengthM[1].toLowerCase());
          name = remaining.substring(0, idx).trim();
          strength = normalizeStrength(strengthM[1]);
          remaining = remaining.substring(idx + strengthM[1].length).trim();
        } else {
          const numM = remaining.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*$/);
          if (numM && numM[1].length > 1) {
            name = numM[1].trim();
            strength = numM[2].trim();
            remaining = '';
          } else {
            name = remaining;
            remaining = '';
          }
        }

        if (remaining) {
          const freq = extractFrequency(remaining);
          if (freq) frequency = freq;
          const dur = extractDuration(remaining);
          if (dur) duration = dur;
          const dcount = extractDosageCount(remaining);
          if (dcount && !dosage) dosage = dcount;
          const wh = extractWhen(remaining);
          if (wh) when = wh;
        }
      }

      name = name.replace(/^\d+\s*/, '').replace(/\b(tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syrup|suspension)\s+/gi, '').trim();

      if (frequency && !dosage) {
        dosage = extractDosageCount(line) || dosage;
      }

      if (!frequency) {
        frequency = extractFrequency(line);
      }
      if (!duration) {
        duration = extractDuration(line);
      }
      if (!when) {
        when = extractWhen(line);
      }

      const instrLower = instructions.toLowerCase();
      if (!when && instrLower) {
        when = extractWhen(instructions);
      }

      const route = (line.toLowerCase().includes('injection') || dosage.toLowerCase().includes('injection') || dosage.toLowerCase().includes('unit') || dosage.toLowerCase().includes('scoop')) ? 'injection' : 'oral';

      if (name.length > 1) {
        meds.push({ name, dosage, strength, frequency, duration, instructions, when, route });
      }
    }

    setParsedMeds(meds);
    if (meds.length > 0) {
      onApplyStructuredMedicines(meds);
      markApplied('medicines');
    }
  }, [pasteText, onApplyStructuredMedicines]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700">Upload Reports & Auto-Fill</h3>
        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">OCR</span>
      </div>

      <div className="p-3 space-y-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('upload')}
            className={cn('flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              activeTab === 'upload' ? 'bg-white text-[#0A75BB] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Upload className="h-3.5 w-3.5" /> Upload Image/PDF
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={cn('flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              activeTab === 'paste' ? 'bg-white text-[#0A75BB] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste Medicine List
          </button>
        </div>

        {activeTab === 'upload' ? (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all',
                isDragOver ? 'border-[#0A75BB] bg-blue-50' : 'border-slate-200 hover:border-[#0A75BB]/40 hover:bg-slate-50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-600">
                Drop reports here or click to upload
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">PDF, JPG, PNG - Lab reports, prescriptions, ultrasound</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded px-2.5 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-700 truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="p-0.5 text-slate-400 hover:text-red-500 shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Scan Button */}
            {files.length > 0 && !result && (
              <button
                onClick={runOCR}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0A75BB] text-white text-xs font-semibold rounded-lg hover:bg-[#085D94] transition-colors disabled:opacity-60"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Scanning reports...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Scan & Extract Data</>
                )}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Paste Area */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400">Copy the medicine table from your app/website and paste below. Separate columns with Tab or 2+ spaces.</p>
              <textarea
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setParsedMeds([]); setAppliedFields(new Set()); }}
                placeholder={`Paste medicine list here...\n\nExample format:\n1\tNexpro rd 40 mg\t1 Tablet(s)\t2 times a Day - Morning, Evening\tBefore Food\t3 months\n2\tTide 20 mg\t1 Tablet(s)\t2 times a Day - Morning, Afternoon\t\t3 months\n3\tSevelamer 400\t1 Tablet(s)\t3 times a Day - Morning, Afternoon, Evening\t\t3 months`}
                className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 resize-none placeholder:text-slate-300"
              />
              <button
                onClick={parsePasteText}
                disabled={!pasteText.trim()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0A75BB] text-white text-xs font-semibold rounded-lg hover:bg-[#085D94] transition-colors disabled:opacity-60"
              >
                <Pill className="h-4 w-4" /> Parse & Fill Medicines
              </button>
            </div>

            {/* Parsed Result */}
            {parsedMeds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700">{parsedMeds.length} medicines parsed</h4>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="h-3 w-3" /> Auto-filled below
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[9px] font-semibold text-slate-400 uppercase px-2">
                  <span className="col-span-2">Medicine</span>
                  <span>Strength</span>
                  <span>Dosage</span>
                  <span>Freq</span>
                  <span>When</span>
                  <span>Duration</span>
                </div>
                {parsedMeds.map((med, i) => (
                  <div key={i} className="grid grid-cols-7 gap-1 bg-slate-50 rounded px-2 py-1.5 items-center">
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">{med.name}</p>
                      {med.route === 'injection' && <span className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded">Inj</span>}
                    </div>
                    <span className="text-[10px] text-slate-600 truncate">{med.strength || '-'}</span>
                    <span className="text-[10px] text-slate-600 truncate">{med.dosage || '-'}</span>
                    <span className="text-[10px] text-slate-600 truncate">{med.frequency || '-'}</span>
                    <span className="text-[10px] text-slate-600 truncate">{med.when || '-'}</span>
                    <span className="text-[10px] text-slate-600 truncate">{med.duration || '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Lab Values */}
            {result.labValues.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-700">Lab Values Found ({result.labValues.length})</h4>
                  <button
                    onClick={() => { onApplyLabValues(result.labValues); markApplied('labs'); }}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded transition-colors',
                      appliedFields.has('labs')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
                    )}
                  >
                    {appliedFields.has('labs') ? <><Check className="h-3 w-3 inline mr-0.5" /> Applied</> : 'Apply All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {result.labValues.map((lv, i) => (
                    <div key={i} className="bg-slate-50 rounded px-2 py-1">
                      <span className="text-[10px] text-slate-500">{lv.testName}</span>
                      <p className="text-xs font-semibold text-slate-800">{lv.value} <span className="font-normal text-slate-500">{lv.unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vitals */}
            {Object.values(result.vitals).some(Boolean) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-700">Vitals Found</h4>
                  <button
                    onClick={() => { onApplyVitals(result.vitals); markApplied('vitals'); }}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded transition-colors',
                      appliedFields.has('vitals')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
                    )}
                  >
                    {appliedFields.has('vitals') ? <><Check className="h-3 w-3 inline mr-0.5" /> Applied</> : 'Apply'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.vitals.systolic && (
                    <span className="text-[11px] bg-slate-50 px-2 py-0.5 rounded">BP: {result.vitals.systolic}/{result.vitals.diastolic}</span>
                  )}
                  {result.vitals.pulse && (
                    <span className="text-[11px] bg-slate-50 px-2 py-0.5 rounded">Pulse: {result.vitals.pulse}</span>
                  )}
                  {result.vitals.weight && (
                    <span className="text-[11px] bg-slate-50 px-2 py-0.5 rounded">Wt: {result.vitals.weight}kg</span>
                  )}
                  {result.vitals.spo2 && (
                    <span className="text-[11px] bg-slate-50 px-2 py-0.5 rounded">SpO2: {result.vitals.spo2}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Complaints */}
            {result.complaints.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-700">Complaints</h4>
                  <button
                    onClick={() => { onApplyComplaints(result.complaints); markApplied('complaints'); }}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded transition-colors',
                      appliedFields.has('complaints')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
                    )}
                  >
                    {appliedFields.has('complaints') ? <><Check className="h-3 w-3 inline mr-0.5" /> Applied</> : 'Apply'}
                  </button>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">{result.complaints.join('; ')}</p>
              </div>
            )}

            {/* Diagnoses */}
            {result.diagnoses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-700">Diagnoses</h4>
                  <button
                    onClick={() => { onApplyDiagnoses(result.diagnoses); markApplied('diagnoses'); }}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded transition-colors',
                      appliedFields.has('diagnoses')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
                    )}
                  >
                    {appliedFields.has('diagnoses') ? <><Check className="h-3 w-3 inline mr-0.5" /> Applied</> : 'Apply'}
                  </button>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">{result.diagnoses.join(', ')}</p>
              </div>
            )}

            {/* Medicines */}
            {result.medicines.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-700">Medicines Found ({result.structuredMedicines.length || result.medicines.length})</h4>
                  <button
                    onClick={() => { if (result.structuredMedicines.length > 0) { onApplyStructuredMedicines(result.structuredMedicines); } else { onApplyMedicines(result.medicines); } markApplied('medicines'); }}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded transition-colors',
                      appliedFields.has('medicines')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
                    )}
                  >
                    {appliedFields.has('medicines') ? <><Check className="h-3 w-3 inline mr-0.5" /> Applied</> : 'Apply All'}
                  </button>
                </div>

                {result.structuredMedicines.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-6 gap-1 text-[9px] font-semibold text-slate-400 uppercase px-2">
                      <span className="col-span-2">Medicine</span>
                      <span>Dosage</span>
                      <span>Freq</span>
                      <span>Duration</span>
                      <span>Instructions</span>
                    </div>
                    {result.structuredMedicines.map((med, i) => (
                      <div key={i} className="grid grid-cols-6 gap-1 bg-slate-50 rounded px-2 py-1.5 items-center">
                        <div className="col-span-2">
                          <p className="text-[11px] font-semibold text-slate-800 truncate">{med.name}</p>
                          {med.route === 'injection' && <span className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded">Inj</span>}
                        </div>
                        <span className="text-[10px] text-slate-600 truncate">{med.dosage}</span>
                        <span className="text-[10px] text-slate-600 truncate">{med.frequency}</span>
                        <span className="text-[10px] text-slate-600 truncate">{med.duration}</span>
                        <span className="text-[10px] text-slate-600 truncate">{med.instructions || med.when || '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {result.medicines.map((med, i) => (
                      <p key={i} className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">{med}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Raw Text (collapsible) */}
            <details className="group">
              <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-600">View raw extracted text</summary>
              <pre className="mt-1 text-[10px] text-slate-500 bg-slate-50 rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                {result.rawText}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
