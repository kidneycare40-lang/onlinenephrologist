'use client';

import React, { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { EMRInvoice } from '@/types/emr';

interface BillingInvoiceProps {
  invoice: EMRInvoice;
  clinicId?: string;
}

const clinicData: Record<string, {
  name: string;
  displayName: string;
  doctorName: string;
  address: string;
  city: string;
  website: string;
  phone: string;
  upiId: string;
  bankName: string;
  accountName: string;
  ifsc: string;
  accountNo: string;
}> = {
  'kcc-faridabad': {
    name: 'KIDNEY CARE CENTRE',
    displayName: 'Kidney Care Centre — Faridabad',
    doctorName: 'Dr. Rajesh Goel',
    address: 'Old Faridabad Main Market, Behind I.T.I Opp. H. N-7',
    city: 'Sec-16, Faridabad',
    website: 'www.kidneycarecentre.in',
    phone: '9818235688, 9818235613',
    upiId: '9818235688@pthdfc',
    bankName: 'HDFC Bank',
    accountName: 'Rajesh Goel',
    ifsc: 'HDFC0001002',
    accountNo: '10021140021585',
  },
  'kcc-saket': {
    name: 'KIDNEY CARE CENTRE',
    displayName: 'Kidney Care Centre — Saket',
    doctorName: 'Dr. Rajesh Goel',
    address: 'A-12, Main Market, Sarvpriya Vihar',
    city: 'Near Hauz Khas, New Delhi - 110017',
    website: 'www.kidneycarecentre.in',
    phone: '9818235688, 9818235613',
    upiId: '9818235688@pthdfc',
    bankName: 'HDFC Bank',
    accountName: 'Rajesh Goel',
    ifsc: 'HDFC0001002',
    accountNo: '10021140021585',
  },
  'psri-delhi': {
    name: 'PSRI Hospital',
    displayName: 'PSRI Hospital — Delhi',
    doctorName: 'Dr. Rajesh Goel',
    address: 'Press Enclave Marg, Sheikh Sarai Phase III',
    city: 'New Delhi - 110017',
    website: 'www.psrihospital.com',
    phone: '011-42255555',
    upiId: '9818235688@pthdfc',
    bankName: 'HDFC Bank',
    accountName: 'Rajesh Goel',
    ifsc: 'HDFC0001002',
    accountNo: '10021140021585',
  },
  'online': {
    name: 'KIDNEY CARE CENTRE',
    displayName: 'Online Video Consultation',
    doctorName: 'Dr. Rajesh Goel',
    address: 'Virtual Consultation via Video Call',
    city: 'Kidney Care Centre',
    website: 'www.kidneycarecentre.in',
    phone: '9818235688, 9818235613',
    upiId: '9818235688@pthdfc',
    bankName: 'HDFC Bank',
    accountName: 'Rajesh Goel',
    ifsc: 'HDFC0001002',
    accountNo: '10021140021585',
  },
};

function formatInvoiceDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const BillingInvoice = forwardRef<HTMLDivElement, BillingInvoiceProps>(
  ({ invoice, clinicId = 'kcc-faridabad' }, ref) => {
    const balance = invoice.grandTotal - invoice.paidAmount;
    const clinic = clinicData[clinicId] || clinicData['kcc-faridabad'];

    return (
      <div ref={ref} style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937', padding: '32px', maxWidth: '800px', margin: '0 auto', background: '#fff' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          {/* Top: Logo + INVOICE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <img src="/images/kidney_logo.png" alt="Kidney Care Centre" style={{ height: '48px' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#0A75BB', letterSpacing: '3px' }}>INVOICE</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}># {invoice.invoiceNumber}</div>
            </div>
          </div>

          {/* Doctor Info Bar */}
          <div style={{ background: 'linear-gradient(135deg, #0A75BB 0%, #085a94 100%)', borderRadius: '10px', padding: '14px 18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '0.5px' }}>{clinic.doctorName}</div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>Sr. Nephrologist</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7', opacity: 0.95 }}>
              <div style={{ fontWeight: '600' }}>Delhi and Faridabad</div>
              <div>www.kidneycarecentre.in</div>
              <div>www.onlinenephrologist.com</div>
            </div>
          </div>

          {/* Contact Bar */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontWeight: '600' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Emergency: 9818235688
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#25D366', fontWeight: '600' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp: 9818235613
            </div>
          </div>
        </div>

        {/* Bill To + Invoice Details Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          {/* Bill To */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Bill To:</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.8' }}>
              <div style={{ fontWeight: '700', color: '#111827' }}>{invoice.patientName}</div>
              {invoice.patientAge && <div>Age : {invoice.patientAge} yrs</div>}
              {invoice.patientGender && <div>Sex : {invoice.patientGender}</div>}
              {invoice.patientPhone && <div>Contact: {invoice.patientPhone}</div>}
              {invoice.patientAddress && <div>{invoice.patientAddress}</div>}
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Date: </span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{formatInvoiceDate(invoice.date)}</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Consultation: </span>
              <span style={{ display: 'inline-block', background: clinicId === 'online' ? '#ecfdf5' : '#eff6ff', color: clinicId === 'online' ? '#065f46' : '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                {clinicId === 'online' ? 'Online Video Consultation' : clinicId === 'kcc-saket' ? 'Kidney Care Centre - Saket' : clinicId === 'psri-delhi' ? 'PSRI Hospital - Delhi' : 'Kidney Care Centre - Faridabad'}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Due Date: </span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{formatInvoiceDate(invoice.dueDate)}</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
              <div style={{ color: '#6b7280', marginBottom: '2px' }}>Balance Due:</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{formatCurrency(balance)}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#374151', color: '#fff' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: '600' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '10px 16px', fontWeight: '600' }}>Quantity</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', fontWeight: '600' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', fontWeight: '600' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 16px', color: '#1f2937', fontWeight: '500' }}>{item.description}</td>
                <td style={{ padding: '10px 16px', textAlign: 'center', color: '#4b5563' }}>{item.qty}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#4b5563' }}>{formatCurrency(item.rate)}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#1f2937', fontWeight: '500' }}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#6b7280' }}>Subtotal:</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#6b7280' }}>Tax ({invoice.gstRate}%):</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formatCurrency(invoice.gstAmount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Discount:</span>
                <span style={{ color: '#dc2626', fontWeight: '500' }}>
                  -{invoice.discountType === 'PERCENTAGE' ? `${invoice.discount}%` : formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', paddingTop: '8px', borderTop: '1px solid #e5e7eb', marginTop: '4px', marginBottom: '6px' }}>
              <span style={{ color: '#111827' }}>Total:</span>
              <span style={{ color: '#111827' }}>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#6b7280' }}>Amount Paid:</span>
              <span style={{ color: '#16a34a', fontWeight: '500' }}>{formatCurrency(invoice.paidAmount)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#6b7280' }}>Payment Mode:</span>
                <span style={{ color: '#111827', fontWeight: '600' }}>
                  {invoice.paymentMethod === 'CASH' ? '💵 Cash' : invoice.paymentMethod === 'UPI' ? '📱 UPI' : invoice.paymentMethod === 'CARD' ? '💳 Card' : invoice.paymentMethod === 'BANK_TRANSFER' ? '🏦 Bank Transfer' : invoice.paymentMethod === 'CHEQUE' ? '📄 Cheque' : invoice.paymentMethod === 'ONLINE' ? '🌐 Online' : invoice.payments?.[0]?.method || '—'}
                </span>
              </div>
            )}
            {invoice.status !== 'PAID' && balance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                <span style={{ color: '#111827' }}>Balance Due:</span>
                <span style={{ color: '#dc2626' }}>{formatCurrency(balance)}</span>
              </div>
            )}
            {invoice.status === 'PAID' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                <span style={{ color: '#111827' }}>Status:</span>
                <span style={{ color: '#16a34a' }}>Paid in Full</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Notes</div>
            <div style={{ fontSize: '12px', color: '#4b5563' }}>{invoice.notes}</div>
          </div>
        )}

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Payment History</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #e5e7eb' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Method</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', color: '#374151' }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{formatInvoiceDate(payment.date)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '500', color: '#16a34a' }}>{formatCurrency(payment.amount)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#4b5563' }}>{payment.method}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>{payment.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Methods */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>Payment Methods</div>
            <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.8' }}>
              <div><strong>Cash:</strong> Pay at reception counter</div>
              <div><strong>Card:</strong> Debit/Credit cards accepted</div>
              <div><strong>Online:</strong> UPI / Bank Transfer</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', marginBottom: '8px' }}>UPI Payment Details</div>
            <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.8' }}>
              <div><strong>UPI ID:</strong> {clinic.upiId}</div>
              <div><strong>Bank:</strong> {clinic.bankName}</div>
              <div><strong>Name:</strong> {clinic.accountName}</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', marginTop: '8px', marginBottom: '4px' }}>RTGS / NEFT</div>
            <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.8' }}>
              <div><strong>IFSC:</strong> {clinic.ifsc}</div>
              <div><strong>A/c No:</strong> {clinic.accountNo}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/upi-qr.jpeg" alt="UPI QR Code" style={{ width: '80px', height: '80px', borderRadius: '4px' }} />
            <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>Scan to Pay</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Thank you for your business!</div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
            KIDNEY CARE CENTRE
          </div>
        </div>
      </div>
    );
  }
);

BillingInvoice.displayName = 'BillingInvoice';

export default BillingInvoice;
