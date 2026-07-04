'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, X, Stethoscope, Pill, FlaskConical, ClipboardList,
  ChevronDown, ChevronUp, Search, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  complaintTemplatesApi,
  diagnosisTemplatesApi,
  medicineTemplatesApi,
  investigationTemplatesApi,
  adviceTemplatesApi,
  medicinesApi,
} from '@/lib/api-client';

type TemplateType = 'complaints' | 'diagnoses' | 'medicines' | 'investigations' | 'advice';

interface TemplateManagerProps {
  clinicId?: string;
  onClose?: () => void;
}

export default function TemplateManager({ clinicId, onClose }: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<TemplateType>('complaints');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [medicineSearchResults, setMedicineSearchResults] = useState<any[]>([]);
  const [searchingMedicines, setSearchingMedicines] = useState(false);

  const tabs: { id: TemplateType; label: string; icon: typeof Stethoscope }[] = [
    { id: 'complaints', label: 'Complaints', icon: Stethoscope },
    { id: 'diagnoses', label: 'Diagnoses', icon: ClipboardList },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'investigations', label: 'Investigations', icon: FlaskConical },
    { id: 'advice', label: 'Advice', icon: CheckCircle2 },
  ];

  const loadTemplates = async (type: TemplateType) => {
    setLoading(true);
    try {
      let data: any[];
      switch (type) {
        case 'complaints':
          data = await complaintTemplatesApi.list();
          break;
        case 'diagnoses':
          data = await diagnosisTemplatesApi.list();
          break;
        case 'medicines':
          data = await medicineTemplatesApi.list();
          break;
        case 'investigations':
          data = await investigationTemplatesApi.list();
          break;
        case 'advice':
          data = await adviceTemplatesApi.list();
          break;
        default:
          data = [];
      }
      setTemplates(data);
    } catch (error) {
      console.error(`Failed to load ${type} templates:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (medicineSearchQuery.length >= 2) {
      setSearchingMedicines(true);
      const debounce = setTimeout(async () => {
        try {
          const results = await medicinesApi.search({ q: medicineSearchQuery, limit: 10 });
          setMedicineSearchResults(results);
        } catch (error) {
          console.error('Medicine search failed:', error);
        } finally {
          setSearchingMedicines(false);
        }
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setMedicineSearchResults([]);
    }
  }, [medicineSearchQuery]);

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      switch (activeTab) {
        case 'complaints':
          if (editingTemplate.id) {
            await complaintTemplatesApi.update(editingTemplate.id, editingTemplate);
          } else {
            await complaintTemplatesApi.create({ ...editingTemplate, clinic_id: clinicId });
          }
          break;
        case 'diagnoses':
          if (editingTemplate.id) {
            await diagnosisTemplatesApi.update(editingTemplate.id, editingTemplate);
          } else {
            await diagnosisTemplatesApi.create({ ...editingTemplate, clinic_id: clinicId });
          }
          break;
        case 'medicines':
          if (editingTemplate.id) {
            await medicineTemplatesApi.update(editingTemplate.id, editingTemplate);
          } else {
            await medicineTemplatesApi.create({ ...editingTemplate, clinic_id: clinicId });
          }
          break;
        case 'investigations':
          if (editingTemplate.id) {
            await investigationTemplatesApi.update(editingTemplate.id, editingTemplate);
          } else {
            await investigationTemplatesApi.create({ ...editingTemplate, clinic_id: clinicId });
          }
          break;
        case 'advice':
          if (editingTemplate.id) {
            await adviceTemplatesApi.update(editingTemplate.id, editingTemplate);
          } else {
            await adviceTemplatesApi.create({ ...editingTemplate, clinic_id: clinicId });
          }
          break;
      }
      setEditingTemplate(null);
      setIsCreating(false);
      loadTemplates(activeTab);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      switch (activeTab) {
        case 'complaints':
          await complaintTemplatesApi.delete(id);
          break;
        case 'diagnoses':
          await diagnosisTemplatesApi.delete(id);
          break;
        case 'medicines':
          await medicineTemplatesApi.delete(id);
          break;
        case 'investigations':
          await investigationTemplatesApi.delete(id);
          break;
        case 'advice':
          await adviceTemplatesApi.delete(id);
          break;
      }
      loadTemplates(activeTab);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const filteredTemplates = templates.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderComplaintForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={editingTemplate.name || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., Swelling - Face"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          value={editingTemplate.category || 'general'}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="general">General</option>
          <option value="renal">Renal</option>
          <option value="cardiovascular">Cardiovascular</option>
          <option value="neurological">Neurological</option>
          <option value="gastrointestinal">Gastrointestinal</option>
          <option value="musculoskeletal">Musculoskeletal</option>
          <option value="skin">Skin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingTemplate.description || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
        />
      </div>
    </div>
  );

  const renderDiagnosisForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={editingTemplate.name || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., CKD Stage 3"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={editingTemplate.category || 'ckd'}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="ckd">CKD</option>
            <option value="aki">AKI</option>
            <option value="glomerular">Glomerular</option>
            <option value="tubular">Tubular</option>
            <option value="vascular">Vascular</option>
            <option value="stones">Stones</option>
            <option value="infection">Infection</option>
            <option value="genetic">Genetic</option>
            <option value="transplant">Transplant</option>
            <option value="dialysis">Dialysis</option>
            <option value="complication">Complication</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Code</label>
          <input
            type="text"
            value={editingTemplate.code || ''}
            onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="e.g., N18.3"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CKD Stage</label>
        <select
          value={editingTemplate.ckd_stage || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, ckd_stage: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Not CKD</option>
          <option value="1">Stage 1</option>
          <option value="2">Stage 2</option>
          <option value="3">Stage 3</option>
          <option value="4">Stage 4</option>
          <option value="5">Stage 5</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingTemplate.description || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
        />
      </div>
    </div>
  );

  const renderMedicineForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
        <input
          type="text"
          value={editingTemplate.name || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., CKD Stage 3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={editingTemplate.category || 'ckd'}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="ckd">CKD</option>
          <option value="transplant">Transplant</option>
          <option value="dialysis">Dialysis</option>
          <option value="hypertension">Hypertension</option>
          <option value="diabetes">Diabetes</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingTemplate.description || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medicines</label>
        <div className="space-y-2">
          {(editingTemplate.items || []).map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="flex-1 text-sm">{item.medicine?.name || item.medicine_name}</span>
              <span className="text-xs text-gray-500">{item.dosage} - {item.frequency}</span>
              <button
                onClick={() => {
                  const newItems = [...editingTemplate.items];
                  newItems.splice(index, 1);
                  setEditingTemplate({ ...editingTemplate, items: newItems });
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={medicineSearchQuery}
            onChange={(e) => setMedicineSearchQuery(e.target.value)}
            placeholder="Search medicines..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {medicineSearchResults.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {medicineSearchResults.map((med) => (
                <button
                  key={med.id}
                  onClick={() => {
                    const newItem = {
                      medicine_id: med.id,
                      medicine_name: med.name,
                      dosage: '1 tablet',
                      frequency: 'Once daily',
                      timing: 'Morning',
                      duration: '30 days',
                    };
                    setEditingTemplate({
                      ...editingTemplate,
                      items: [...(editingTemplate.items || []), newItem],
                    });
                    setMedicineSearchQuery('');
                    setMedicineSearchResults([]);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium">{med.name}</div>
                  <div className="text-xs text-gray-500">{med.generic_name} - {med.strength}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInvestigationForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
        <input
          type="text"
          value={editingTemplate.name || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., CKD Workup"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={editingTemplate.category || 'ckd'}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="ckd">CKD</option>
          <option value="dialysis">Dialysis</option>
          <option value="transplant">Transplant</option>
          <option value="aki">AKI</option>
          <option value="glomerular">Glomerular</option>
          <option value="stones">Stones</option>
          <option value="infection">Infection</option>
          <option value="general">General</option>
          <option value="diabetes">Diabetes</option>
          <option value="hypertension">Hypertension</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingTemplate.description || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tests</label>
        <div className="space-y-2">
          {(editingTemplate.items || []).map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="flex-1 text-sm">{item.test_name}</span>
              <span className="text-xs text-gray-500">{item.category}</span>
              <button
                onClick={() => {
                  const newItems = [...editingTemplate.items];
                  newItems.splice(index, 1);
                  setEditingTemplate({ ...editingTemplate, items: newItems });
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newItem = {
              test_name: '',
              category: 'blood',
            };
            setEditingTemplate({
              ...editingTemplate,
              items: [...(editingTemplate.items || []), newItem],
            });
          }}
          className="mt-2 inline-flex items-center gap-1 text-sm text-[#0A75BB] hover:underline"
        >
          <Plus className="h-4 w-4" /> Add Test
        </button>
      </div>
    </div>
  );

  const renderAdviceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
        <input
          type="text"
          value={editingTemplate.name || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., CKD Advice"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={editingTemplate.category || 'diet'}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="diet">Diet</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="medication">Medication</option>
          <option value="follow_up">Follow-up</option>
          <option value="dialysis">Dialysis</option>
          <option value="transplant">Transplant</option>
          <option value="diabetes">Diabetes</option>
          <option value="hypertension">Hypertension</option>
          <option value="stones">Stones</option>
          <option value="infection">Infection</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={editingTemplate.description || ''}
          onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Advice Points</label>
        <div className="space-y-2">
          {(editingTemplate.items || []).map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={item.advice_text}
                onChange={(e) => {
                  const newItems = [...editingTemplate.items];
                  newItems[index] = { ...newItems[index], advice_text: e.target.value };
                  setEditingTemplate({ ...editingTemplate, items: newItems });
                }}
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={item.is_critical}
                  onChange={(e) => {
                    const newItems = [...editingTemplate.items];
                    newItems[index] = { ...newItems[index], is_critical: e.target.checked };
                    setEditingTemplate({ ...editingTemplate, items: newItems });
                  }}
                  className="rounded"
                />
                Critical
              </label>
              <button
                onClick={() => {
                  const newItems = [...editingTemplate.items];
                  newItems.splice(index, 1);
                  setEditingTemplate({ ...editingTemplate, items: newItems });
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newItem = {
              advice_text: '',
              category: 'general',
              is_critical: false,
            };
            setEditingTemplate({
              ...editingTemplate,
              items: [...(editingTemplate.items || []), newItem],
            });
          }}
          className="mt-2 inline-flex items-center gap-1 text-sm text-[#0A75BB] hover:underline"
        >
          <Plus className="h-4 w-4" /> Add Advice
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'complaints':
        return renderComplaintForm();
      case 'diagnoses':
        return renderDiagnosisForm();
      case 'medicines':
        return renderMedicineForm();
      case 'investigations':
        return renderInvestigationForm();
      case 'advice':
        return renderAdviceForm();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Template Management</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingTemplate(null);
                setIsCreating(false);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-[#0A75BB] text-[#0A75BB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingTemplate({
                category: activeTab === 'complaints' ? 'general' : 'ckd',
              });
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#0A75BB]/90"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No templates found</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.category}
                    {template.ckd_stage && ` • CKD Stage ${template.ckd_stage}`}
                    {template.is_system && ' • System'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.is_system ? (
                    <span className="text-xs text-gray-400">System</span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsCreating(false);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Pill className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {isCreating ? `Create ${activeTab.slice(0, -1)} Template` : `Edit ${activeTab.slice(0, -1)} Template`}
              </h3>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">{renderForm()}</div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingTemplate.name}
                className="px-4 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#0A75BB]/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4 inline mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
