'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stethoscope, Pill, FlaskConical, ClipboardList, CheckCircle2,
  ChevronDown, ChevronUp, Search, X, Plus, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  complaintTemplatesApi,
  diagnosisTemplatesApi,
  medicinesApi,
  medicineTemplatesApi,
  investigationTemplatesApi,
  adviceTemplatesApi,
} from '@/lib/api-client';

interface TemplateSelectorProps {
  type: 'complaints' | 'diagnoses' | 'medicines' | 'investigations' | 'advice';
  onSelect: (items: any[]) => void;
  selectedItems?: any[];
  clinicId?: string;
  compact?: boolean;
}

export default function TemplateSelector({
  type,
  onSelect,
  selectedItems = [],
  clinicId,
  compact = false,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [medicineSearchResults, setMedicineSearchResults] = useState<any[]>([]);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadTemplates = useCallback(async () => {
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
  }, [type]);

  useEffect(() => {
    if (expanded) {
      loadTemplates();
    }
  }, [expanded, loadTemplates]);

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

  const handleTemplateClick = (template: any) => {
    if (type === 'medicines' || type === 'investigations' || type === 'advice') {
      // For templates with items, add all items
      const items = template.items || [];
      const newItems = items.map((item: any) => ({
        ...item,
        template_id: template.id,
        template_name: template.name,
      }));
      onSelect([...selectedItems, ...newItems]);
    } else {
      // For complaints/diagnoses, add single item
      const newItem = {
        template_id: template.id,
        template_name: template.name,
        name: template.name,
        category: template.category,
      };
      onSelect([...selectedItems, newItem]);
    }
  };

  const handleMedicineSelect = (medicine: any) => {
    const newItem = {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      generic_name: medicine.generic_name,
      form: medicine.form,
      strength: medicine.strength,
      dosage: '1 tablet',
      frequency: 'Once daily',
      timing: 'Morning',
      duration: '30 days',
      is_nephrotoxic: medicine.is_nephrotoxic,
      requires_monitoring: medicine.requires_monitoring,
      monitoring_parameters: medicine.monitoring_parameters,
    };
    onSelect([...selectedItems, newItem]);
    setMedicineSearchQuery('');
    setMedicineSearchResults([]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    onSelect(newItems);
  };

  const filteredTemplates = templates.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const icons = {
    complaints: Stethoscope,
    diagnoses: ClipboardList,
    medicines: Pill,
    investigations: FlaskConical,
    advice: CheckCircle2,
  };
  const Icon = icons[type];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors',
          expanded && 'bg-gray-50'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#0A75BB]" />
          <span className="text-sm font-medium text-gray-700">
            {type === 'complaints' && 'Quick Complaints'}
            {type === 'diagnoses' && 'Quick Diagnosis'}
            {type === 'medicines' && 'Medicine Search & Templates'}
            {type === 'investigations' && 'Investigation Panels'}
            {type === 'advice' && 'Advice Templates'}
          </span>
          {selectedItems.length > 0 && (
            <span className="px-2 py-0.5 bg-[#0A75BB]/10 text-[#0A75BB] text-xs rounded-full">
              {selectedItems.length} selected
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {/* Medicine Search (only for medicines type) */}
          {type === 'medicines' && (
            <div className="relative">
              <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={medicineSearchQuery}
                onChange={(e) => setMedicineSearchQuery(e.target.value)}
                placeholder="Search medicines by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
              {searchingMedicines && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-[#0A75BB] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {medicineSearchResults.length > 0 && (
                <div className="absolute z-[170] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {medicineSearchResults.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => handleMedicineSelect(med)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{med.name}</div>
                          <div className="text-xs text-gray-500">
                            {med.generic_name} • {med.strength}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {med.is_nephrotoxic && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">
                              Nephrotoxic
                            </span>
                          )}
                          <Plus className="h-4 w-4 text-[#0A75BB]" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Templates List */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {loading ? (
              <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No templates found</div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-700">{template.name}</div>
                    <div className="text-xs text-gray-500">
                      {template.category}
                      {template.items && ` • ${template.items.length} items`}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-[#0A75BB] opacity-0 group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>

          {/* Selected Items Preview */}
          {selectedItems.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Selected:</div>
              <div className="space-y-1">
                {selectedItems.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-[#0A75BB]/5 rounded text-xs"
                  >
                    <span className="text-[#0A75BB]">
                      {item.medicine_name || item.name || item.advice_text || item.test_name}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {selectedItems.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{selectedItems.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
