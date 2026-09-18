'use client';

import { useState, useEffect } from 'react';
import { SITE_CONFIGS, type SiteConfig } from '@/lib/site-config';
import {
  Globe, Building2, Calendar, Users, CreditCard, Bell, Settings,
  Loader2, Check, X, Plus, Trash2, ExternalLink, Copy, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'sites' | 'bookings' | 'patients' | 'payments' | 'notifications' | 'tools';

interface SiteStats {
  siteId: string;
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [siteStats, setSiteStats] = useState<Record<string, SiteStats>>({});
  const [loading, setLoading] = useState(false);
  const [copiedSiteId, setCopiedSiteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteStats();
  }, []);

  const fetchSiteStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sites');
      if (res.ok) {
        const data = await res.json();
        setSiteStats(data.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch site stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyEmbedCode = (siteId: string) => {
    const code = `<iframe src="https://www.onlinenephrologist.com/book-appointment?site=${siteId}&embed=1" width="100%" height="800" frameborder="0" id="${siteId}-booking-frame"></iframe>\n<script>\nwindow.addEventListener('message', function(e) {\n  if (e.data.type === 'iframe-resize') {\n    document.getElementById('${siteId}-booking-frame').style.height = e.data.height + 'px';\n  }\n  if (e.data.type === 'iframe-scroll-top') {\n    document.getElementById('${siteId}-booking-frame').scrollIntoView({ behavior: 'smooth' });\n  }\n});\n</script>`;
    navigator.clipboard.writeText(code);
    setCopiedSiteId(siteId);
    setTimeout(() => setCopiedSiteId(null), 2000);
  };

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tools', label: 'Tools', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Manage booking sites, view bookings, and configure settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sites' && <SitesTab siteStats={siteStats} copiedSiteId={copiedSiteId} copyEmbedCode={copyEmbedCode} />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'patients' && <PatientsTab />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'tools' && <ToolsTab />}
    </div>
  );
}

function SitesTab({ siteStats, copiedSiteId, copyEmbedCode }: { siteStats: Record<string, SiteStats>; copiedSiteId: string | null; copyEmbedCode: (id: string) => void }) {
  const [showPreview, setShowPreview] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Configured Sites</h2>
        <span className="text-sm text-gray-500">{Object.keys(SITE_CONFIGS).length} sites</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(SITE_CONFIGS).map((site) => {
          const stats = siteStats[site.id];
          return (
            <div key={site.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: site.primaryColor }}
                  >
                    {site.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-xs text-gray-500">{site.domain}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: site.primaryColor + '20', color: site.primaryColor }}
                >
                  {site.id}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>{site.clinicId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>{site.consultationType}</span>
                </div>
                {site.fee && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span>{site.feeCurrency === 'USD' ? '$' : '₹'}{site.fee}</span>
                  </div>
                )}
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.totalBookings}</div>
                    <div className="text-[10px] text-gray-500">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.paidBookings}</div>
                    <div className="text-[10px] text-gray-500">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">Revenue</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => copyEmbedCode(site.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {copiedSiteId === site.id ? (
                    <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Embed</>
                  )}
                </button>
                <button
                  onClick={() => setShowPreview(showPreview === site.id ? null : site.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </button>
              </div>

              {showPreview === site.id && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview URL:</p>
                  <code className="block text-xs bg-gray-50 p-2 rounded break-all">
                    https://www.onlinenephrologist.com/book-appointment?site={site.id}&embed=1
                  </code>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSite, setFilterSite] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filterSite, filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSite) params.set('site', filterSite);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
        >
          <option value="">All Sites</option>
          {Object.values(SITE_CONFIGS).map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={fetchBookings} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No bookings found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Patient</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Site</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id || b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-mono text-xs">{b.booking_id || b.id}</td>
                  <td className="py-3 px-2">{b.first_name} {b.last_name}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{b.site_id || 'online'}</span>
                  </td>
                  <td className="py-3 px-2">{b.consultation_type}</td>
                  <td className="py-3 px-2">{b.booking_date}</td>
                  <td className="py-3 px-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      b.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      b.payment_status === 'unpaid' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {b.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PatientsTab() {
  return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Use the <a href="/emr/patients" className="text-blue-600 hover:underline">Patients</a> page to view and manage patients.</p>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="text-center py-12 text-gray-500">
      <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Use the <a href="/emr/billing" className="text-blue-600 hover:underline">Billing</a> page to view and manage payments.</p>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="text-center py-12 text-gray-500">
      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Notification logs are available in the <a href="/emr/billing" className="text-blue-600 hover:underline">Billing</a> page.</p>
    </div>
  );
}

function ToolsTab() {
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  const runReconcile = async () => {
    setReconciling(true);
    try {
      const res = await fetch('/api/admin/reconcile-bookings', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReconcileResult(data);
      }
    } catch (err) {
      console.error('Reconcile failed:', err);
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Reconcile Bookings</h3>
        <p className="text-sm text-gray-500 mb-4">
          Create missing booking records, EMR appointments, and invoices for captured payments.
        </p>
        <button
          onClick={runReconcile}
          disabled={reconciling}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {reconciling ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          Run Reconciliation
        </button>
        {reconcileResult && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
            <pre className="whitespace-pre-wrap">{JSON.stringify(reconcileResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Cleanup Duplicate Patients</h3>
        <p className="text-sm text-gray-500 mb-4">
          Remove junk OB- patients with no phone/email and duplicate entries.
        </p>
        <a
          href="/api/admin/cleanup-duplicate-patients"
          target="_blank"
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 inline-block"
        >
          Run Cleanup
        </a>
      </div>
    </div>
  );
}
