'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { loadConsultationSettings } from '@/lib/consultation-settings';
import {
  HeartPulse, ClipboardList, FileText, MessageSquare,
  FlaskConical, Stethoscope, Pill, Lightbulb, TestTube,
  GitBranch, Activity, Droplets, Heart, Apple,
} from 'lucide-react';

interface ConsultSidebarProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartPulse, ClipboardList, FileText, MessageSquare,
  FlaskConical, Stethoscope, Pill, Lightbulb, TestTube,
  GitBranch, Activity, Droplets, Heart, Apple,
};

const defaultSections = [
  { id: 'vitals', label: 'Vitals', icon: 'HeartPulse' },
  { id: 'history', label: 'History', icon: 'ClipboardList' },
  { id: 'past-history', label: 'Past History', icon: 'FileText' },
  { id: 'complaints', label: 'Complaints', icon: 'MessageSquare' },
  { id: 'investigations', label: 'Investigations', icon: 'FlaskConical' },
  { id: 'diagnosis', label: 'Diagnosis', icon: 'Stethoscope' },
  { id: 'medicine', label: 'Medicine', icon: 'Pill' },
  { id: 'advice', label: 'Advice', icon: 'Lightbulb' },
  { id: 'tests-requested', label: 'Tests', icon: 'TestTube' },
  { id: 'ckd-graph', label: 'CKD Graph', icon: 'Activity', type: 'link' as const, href: '/emr/ckd-dashboard' },
  { id: 'dialysis', label: 'Dialysis', icon: 'Droplets', type: 'link' as const, href: '/emr/dialysis' },
  { id: 'transplant', label: 'Transplant', icon: 'Heart', type: 'link' as const, href: '/emr/transplant' },
  { id: 'diet', label: 'Diet', icon: 'Apple', type: 'link' as const, href: '/emr/ckd-dashboard' },
  { id: 'timeline', label: 'Timeline', icon: 'GitBranch' },
];

export default function ConsultSidebar({ activeSection, onSectionClick }: ConsultSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sidebarItems = useMemo(() => {
    const settings = loadConsultationSettings();
    const enabledIds = new Set(settings.sections.filter(s => s.enabled).map(s => s.id));
    const ordered = settings.sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map(s => {
        const fallback = defaultSections.find(d => d.id === s.id);
        return {
          id: s.id,
          label: s.label,
          icon: iconMap[s.icon] || FileText,
          type: s.isLink ? ('link' as const) : undefined,
          href: s.href || fallback?.href,
        };
      });
    if (ordered.length === 0) {
      return defaultSections.map(d => ({
        ...d,
        icon: iconMap[d.icon] || FileText,
      }));
    }
    return ordered;
  }, []);

  // Auto-scroll to active tab on mobile
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  return (
    <>
      {/* Desktop: vertical icon sidebar */}
      <div className="hidden lg:flex w-14 min-w-[56px] bg-[#1e293b] flex-col items-center py-2 gap-0.5 overflow-y-auto flex-shrink-0 border-r border-slate-700 no-print">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.type === 'link' && item.href) {
                  window.open(item.href, '_blank');
                } else {
                  onSectionClick(item.id);
                }
              }}
              className={cn(
                'w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-150 group relative',
                isActive
                  ? 'bg-[#0A75BB] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[7px] mt-0.5 leading-none font-medium">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: horizontal scrollable tab bar */}
      <div className="lg:hidden sticky top-14 z-30 bg-[#1e293b] border-b border-slate-700 no-print">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide gap-1 px-2 py-1.5"
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                data-active={isActive}
                onClick={() => {
                  if (item.type === 'link' && item.href) {
                    window.open(item.href, '_blank');
                  } else {
                    onSectionClick(item.id);
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 touch-target',
                  isActive
                    ? 'bg-[#0A75BB] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
