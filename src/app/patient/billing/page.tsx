'use client';

import { useState, useEffect } from 'react';
import { Receipt, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  discount: number;
  gst_amount: number;
  total_tax: number;
  grand_total: number;
  paid_amount: number;
  balance: number;
  status: string;
  clinic_name: string;
  items: { description: string; quantity: number; rate: number; amount: number; total: number }[];
  payments: { amount: number; method: string; payment_date: string; reference: string | null; status: string }[];
}

interface BookingPayment {
  booking_id: string;
  patient_name: string;
  amount: number;
  currency: string;
  razorpay_payment_id: string | null;
  payment_status: string;
  created_at: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookingPayments, setBookingPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/patient-auth/billing')
      .then(r => r.json())
      .then(d => {
        setInvoices(d.invoices || []);
        setBookingPayments(d.bookingPayments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>

      {/* Online Payments */}
      {bookingPayments.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Online Payments</h2>
          <div className="space-y-2">
            {bookingPayments.map((bp, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{bp.booking_id}</p>
                    <p className="text-xs text-gray-500">
                      {bp.currency === 'USD' ? `$${bp.amount}` : `₹${bp.amount}`} · Razorpay
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bp.payment_status === 'CAPTURED' ? 'bg-green-100 text-green-700' :
                    bp.payment_status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {bp.payment_status}
                  </span>
                </div>
                {bp.razorpay_payment_id && (
                  <p className="text-[10px] text-gray-400 mt-2 ml-13">Txn: {bp.razorpay_payment_id}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EMR Invoices */}
      {invoices.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invoices</h2>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{inv.invoice_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        inv.status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inv.invoice_date} · ₹{inv.grand_total} · {inv.clinic_name || 'KCC'}
                    </p>
                  </div>
                  {expandedId === inv.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {expandedId === inv.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    {inv.items.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                        <div className="space-y-1">
                          {inv.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.description}</span>
                              <span className="font-medium text-gray-900">₹{item.total || item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">₹{inv.subtotal}</span>
                      </div>
                      {inv.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-green-600">-₹{inv.discount}</span>
                        </div>
                      )}
                      {inv.gst_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">GST</span>
                          <span className="text-gray-900">₹{inv.gst_amount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">₹{inv.grand_total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Paid</span>
                        <span className="text-green-600">₹{inv.paid_amount}</span>
                      </div>
                      {inv.balance > 0 && (
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-gray-500">Outstanding</span>
                          <span className="text-red-600">₹{inv.balance}</span>
                        </div>
                      )}
                    </div>

                    {inv.payments.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment History</h4>
                        <div className="space-y-1">
                          {inv.payments.map((pay, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-600">
                              <span>{pay.method} · {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString('en-IN') : ''}</span>
                              <span className="font-medium">₹{pay.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {invoices.length === 0 && bookingPayments.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No billing records yet</p>
        </div>
      )}
    </div>
  );
}
