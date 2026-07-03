'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { abbreviationCategories, abbreviations, getAbbreviationsByCategory, searchAbbreviations, type Abbreviation } from '@/lib/medical-abbreviations';

export default function MedicalAbbreviationsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAbbreviations = useMemo(() => {
    if (search.trim()) return searchAbbreviations(search);
    if (activeCategory) return getAbbreviationsByCategory(activeCategory);
    return abbreviations;
  }, [search, activeCategory]);

  const groupedByCategory = useMemo(() => {
    if (search.trim()) return null;
    if (activeCategory) {
      const cat = abbreviationCategories.find((c) => c.id === activeCategory);
      return cat ? { [cat.label]: filteredAbbreviations } : null;
    }
    const groups: Record<string, Abbreviation[]> = {};
    for (const cat of abbreviationCategories) {
      const items = abbreviations.filter((a) => a.category === cat.id);
      if (items.length > 0) groups[cat.label] = items;
    }
    return groups;
  }, [activeCategory, filteredAbbreviations, search]);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            📋 Medical Abbreviations
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">OD, BD, SOS &amp; More — Medical Terms Explained</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            What do OD, BD, TDS, SOS, HS mean on your prescription? Complete guide to medical abbreviations used in prescriptions.
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
                placeholder="Search abbreviations (OD, BD, SOS, IV, SC...)"
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !activeCategory ? 'bg-[#0A75BB] text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All ({abbreviations.length})
              </button>
              {abbreviationCategories.map((cat) => {
                const count = getAbbreviationsByCategory(cat.id).length;
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
            <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}>
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}>
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Always confirm with your doctor</p>
              <p>Abbreviations can vary between countries and hospitals. Always verify with your prescribing doctor or pharmacist if unsure.</p>
            </div>
          </div>

          {/* Search Results Count */}
          {search && (
            <p className="text-sm text-gray-500 mb-4">
              Found <span className="font-semibold text-gray-900">{filteredAbbreviations.length}</span> abbreviations matching &ldquo;{search}&rdquo;
            </p>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && groupedByCategory && Object.entries(groupedByCategory).map(([catLabel, items]) => (
            <div key={catLabel} className="mb-8">
              {!search && <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{catLabel}</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((abbr) => (
                  <AbbreviationCard key={abbr.id} abbr={abbr} expanded={expandedTerm === abbr.id} onToggle={() => setExpandedTerm(expandedTerm === abbr.id ? null : abbr.id)} />
                ))}
              </div>
            </div>
          ))}

          {search && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAbbreviations.map((abbr) => (
                <AbbreviationCard key={abbr.id} abbr={abbr} expanded={expandedTerm === abbr.id} onToggle={() => setExpandedTerm(expandedTerm === abbr.id ? null : abbr.id)} />
              ))}
            </div>
          )}

          {filteredAbbreviations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No abbreviations found matching your search.</p>
            </div>
          )}

          {/* Quick Reference Table */}
          {!search && !activeCategory && (
            <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Quick Reference — Most Common Terms</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">Abbreviation</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Full Form</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Meaning</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {['od', 'bd', 'tds', 'sos', 'hs', 'ac', 'pc', 'iv', 'sc', 'im'].map((id) => {
                      const a = abbreviations.find((x) => x.id === id);
                      if (!a) return null;
                      return (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-bold text-[#0A75BB]">{a.term}</td>
                          <td className="px-6 py-3 text-gray-700">{a.fullName}</td>
                          <td className="px-6 py-3 text-gray-500">{a.description.split('.')[0]}</td>
                          <td className="px-6 py-3 text-gray-400 text-xs">{a.example}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/medicines" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all mr-3">
              Medicines Guide <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
              Consult Dr Rajesh Goel <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function AbbreviationCard({ abbr, expanded, onToggle }: { abbr: Abbreviation; expanded: boolean; onToggle: () => void }) {
  const cat = abbreviationCategories.find((c) => c.id === abbr.category);

  return (
    <div
      className={`bg-white rounded-xl border cursor-pointer transition-all ${
        expanded ? 'border-[#0A75BB]/30 shadow-md ring-1 ring-[#0A75BB]/10' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{abbr.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-[#0A75BB]">{abbr.term}</span>
              <span className="text-xs text-gray-500 font-medium">{abbr.fullName}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{abbr.description}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
          {abbr.example && (
            <div className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-500 text-xs">Example:</span>
                <p className="text-gray-700">{abbr.example}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {cat && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                {cat.icon} {cat.label}
              </span>
            )}
            {abbr.timesPerDay !== undefined && abbr.timesPerDay > 0 && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                {abbr.timesPerDay}× per day
              </span>
            )}
            {abbr.timesPerDay === 0 && (
              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-lg">
                As needed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
