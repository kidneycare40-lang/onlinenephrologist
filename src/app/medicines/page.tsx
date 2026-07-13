'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG } from '@/lib/constants';
import { Search, ChevronDown, ChevronRight, AlertTriangle, Info, Pill, BookOpen } from 'lucide-react';
import { medicineCategories, medicines, getMedicinesByCategory, searchMedicines, type Medicine } from '@/lib/medicines-data';

export default function MedicinesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedMedicine, setExpandedMedicine] = useState<string | null>(null);

  const filteredMedicines = useMemo(() => {
    if (search.trim()) return searchMedicines(search);
    if (activeCategory) return getMedicinesByCategory(activeCategory);
    return medicines;
  }, [search, activeCategory]);

  const groupedBySubcategory = useMemo(() => {
    if (!activeCategory || search.trim()) return null;
    const cats = medicineCategories.find((c) => c.id === activeCategory);
    if (!cats?.subcategories) return null;
    const groups: Record<string, Medicine[]> = {};
    for (const sub of cats.subcategories) {
      const items = filteredMedicines.filter((m) => m.subcategory === sub);
      if (items.length > 0) groups[sub] = items;
    }
    const uncategorized = filteredMedicines.filter((m) => !m.subcategory || !cats.subcategories?.includes(m.subcategory));
    if (uncategorized.length > 0) groups['General'] = uncategorized;
    return groups;
  }, [activeCategory, filteredMedicines, search]);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Pill className="h-4 w-4" /> Medicines & Treatment Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">General Medicines & Treatment Guide</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Commonly prescribed medicines and guidance for kidney and dialysis patients. Always use under supervision of your treating nephrologist.
          </p>
        </div>
      </section>

      <section className="py-8 bg-gray-50 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
                placeholder="Search medicines, conditions, or dosage..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          {!search && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !activeCategory ? 'bg-[#0A75BB] text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All ({medicines.length})
              </button>
              {medicineCategories.map((cat) => {
                const count = getMedicinesByCategory(cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.id ? 'bg-[#0A75BB] text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="text-xs opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Warning Banner */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Important Notice</p>
              <p>This guide is for informational purposes only. Always consult your nephrologist before starting, changing, or stopping any medication.</p>
            </div>
          </div>

          {/* Search Results Count */}
          {search && (
            <p className="text-sm text-gray-500 mb-4">
              Found <span className="font-semibold text-gray-900">{filteredMedicines.length}</span> medicines matching &ldquo;{search}&rdquo;
            </p>
          )}

          {/* Category Header */}
          {activeCategory && !search && (
            <div className="mb-6">
              {(() => {
                const cat = medicineCategories.find((c) => c.id === activeCategory);
                if (!cat) return null;
                return (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Medicine List */}
          <div className="space-y-3">
            {groupedBySubcategory
              ? Object.entries(groupedBySubcategory).map(([sub, items]) => (
                  <div key={sub}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{sub}</h3>
                    <div className="space-y-2">
                      {items.map((med) => (
                        <MedicineCard key={med.id} med={med} expanded={expandedMedicine === med.id} onToggle={() => setExpandedMedicine(expandedMedicine === med.id ? null : med.id)} />
                      ))}
                    </div>
                  </div>
                ))
              : filteredMedicines.map((med) => (
                  <MedicineCard key={med.id} med={med} expanded={expandedMedicine === med.id} onToggle={() => setExpandedMedicine(expandedMedicine === med.id ? null : med.id)} />
                ))
            }

            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medicines found matching your search.</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
              Consult Dr Rajesh Goel <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Kidney Medicines & Treatment Guide', url: `${SITE_CONFIG.url}/medicines` },
        ]}
      />
      <WebPageSchema
        title="Kidney Medicines & Treatment Guide | Dr Rajesh Goel"
        description="Complete guide to commonly prescribed medicines for kidney and dialysis patients. Includes dosage, frequency, warnings, and precautions."
        url={`${SITE_CONFIG.url}/medicines`}
      />
      <Footer />
    </>
  );
}

function MedicineCard({ med, expanded, onToggle }: { med: Medicine; expanded: boolean; onToggle: () => void }) {
  const levelColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  const categoryObj = medicineCategories.find((c) => c.id === med.category);

  return (
    <div className={`bg-white rounded-xl border transition-all ${expanded ? 'border-[#0A75BB]/30 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <span className="text-lg shrink-0">{categoryObj?.icon ?? '💊'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{med.name}</p>
            {med.warning && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">⚠️ Caution</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span className="font-medium">{med.dosage}</span>
            <span>·</span>
            <span>{med.frequency}</span>
            {med.duration && <><span>·</span><span>{med.duration}</span></>}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3 space-y-2">
            {med.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p>{med.notes}</p>
              </div>
            )}
            {med.warning && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium">{med.warning}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {med.category && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                  {categoryObj?.icon} {categoryObj?.label}
                </span>
              )}
              {med.subcategory && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{med.subcategory}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
