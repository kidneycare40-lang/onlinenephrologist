'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Smartphone, CheckCircle2, X, Loader2, ExternalLink, Copy, AlertTriangle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadBookingSettings } from '@/lib/booking-settings';
import { getConsultationPricing, formatPricing } from '@/lib/pricing';

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  bookingId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientCountry?: string;
  consultationType: string;
  isInternational?: boolean;
  onPaymentSuccess: (paymentData: PaymentData) => void;
  onPaymentFailed: (reason: string) => void;
  onSkipPayment: () => void;
}

export interface PaymentData {
  paymentId: string;
  method: 'razorpay' | 'upi-qr' | 'upi-link' | 'manual';
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  timestamp: string;
  orderId?: string;
}

function generateUPILink(upiId: string, amount: number, payeeName: string, txnNote: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: String(amount),
    cu: 'INR',
    tn: txnNote,
  });
  return `upi://pay?${params.toString()}`;
}

function generateUPIQrData(upiId: string, amount: number, payeeName: string, txnNote: string): string {
  return generateUPILink(upiId, amount, payeeName, txnNote);
}

export default function PaymentGateway({
  amount,
  currency,
  bookingId,
  patientName,
  patientPhone,
  patientEmail,
  patientCountry,
  consultationType,
  isInternational,
  onPaymentSuccess,
  onPaymentFailed,
  onSkipPayment,
}: PaymentGatewayProps) {
  const [settings] = useState(() => loadBookingSettings());
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'upi-qr' | 'upi-link'>('razorpay');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [failureReason, setFailureReason] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; amount: number; currency: string; keyId: string } | null>(null);

  const pg = settings.paymentGateway;
  const pricing = getConsultationPricing(consultationType);
  const displayAmount = pricing.amount || amount;
  const displayCurrency = pricing.currency || currency;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setRazorpayLoaded(false);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Server-side order creation — amount/currency are decided on the server
  const createOrder = async (): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> => {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        patientName,
        patientPhone,
        patientEmail: patientEmail || '',
        patientCountry: patientCountry || '',
        consultationType,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create payment order');
    }
    return data;
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string): Promise<void> => {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setPaymentStatus('processing');
    setFailureReason('');

    let order;
    try {
      order = await createOrder();
      setOrderInfo(order);
    } catch (e) {
      setProcessing(false);
      setPaymentStatus('failed');
      setFailureReason(e instanceof Error ? e.message : 'Failed to create payment order');
      onPaymentFailed(failureReason);
      return;
    }

    if (!(window as any).Razorpay) {
      setProcessing(false);
      setPaymentStatus('failed');
      setFailureReason('Razorpay checkout failed to load. Please try again.');
      onPaymentFailed('Razorpay not loaded');
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'Kidney Care Centre',
      description: `${consultationType === 'online_intl' ? 'International' : consultationType === 'offline' ? 'In-Clinic' : consultationType === 'hospital' ? 'Hospital' : 'Online'} Consultation - ${bookingId}`,
      order_id: order.orderId,
      prefill: {
        name: patientName,
        contact: patientPhone,
        ...(patientEmail ? { email: patientEmail } : {}),
      },
      theme: { color: '#0A75BB' },
      handler: async function (response: any) {
        try {
          await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          const paymentData: PaymentData = {
            paymentId: response.razorpay_payment_id,
            method: 'razorpay',
            amount: order.amount,
            currency: order.currency,
            status: 'paid',
            timestamp: new Date().toISOString(),
            orderId: response.razorpay_order_id,
          };
          setPaymentStatus('success');
          setProcessing(false);
          onPaymentSuccess(paymentData);
        } catch (e) {
          setProcessing(false);
          setPaymentStatus('failed');
          setFailureReason(e instanceof Error ? e.message : 'Payment could not be verified');
          onPaymentFailed(failureReason);
        }
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
          setPaymentStatus('failed');
          setFailureReason('Payment cancelled by user');
          onPaymentFailed('Payment cancelled by user');
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setProcessing(false);
        setPaymentStatus('failed');
        setFailureReason(response.error?.description || 'Payment failed');
        onPaymentFailed(response.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch {
      setProcessing(false);
      setPaymentStatus('failed');
      setFailureReason('Failed to open Razorpay checkout');
      onPaymentFailed('Failed to open Razorpay checkout');
    }
  };

  const handleUPIQRPayment = () => {
    setProcessing(true);
    setPaymentStatus('processing');
    setTimeout(() => {
      const paymentData: PaymentData = {
        paymentId: `upi-${Date.now()}`,
        method: 'upi-qr',
        amount,
        currency: 'INR',
        status: 'paid',
        timestamp: new Date().toISOString(),
      };
      setPaymentStatus('success');
      setProcessing(false);
      onPaymentSuccess(paymentData);
    }, 3000);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(pg.upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = pg.upiId ? generateUPIQrData(pg.upiId, amount, 'Kidney Care Centre', `Consultation ${bookingId}`) : '';
  const upiLink = pg.upiId ? generateUPILink(pg.upiId, amount, 'Kidney Care Centre', `Consultation ${bookingId}`) : '';

  if (pg.provider === 'manual' || !pg.enabled) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
        <CreditCard className="h-10 w-10 text-blue-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">Pay at Clinic</p>
        <p className="text-sm text-gray-500 mt-1">Please pay {displayCurrency === 'USD' ? `$${displayAmount}` : `₹${displayAmount}`} when you visit the clinic</p>
        <button onClick={onSkipPayment} className="mt-4 px-6 py-2.5 bg-[#0A75BB] text-white rounded-xl text-sm font-semibold hover:bg-[#085a94] transition-colors">
          Continue Without Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Payment Summary */}
      <div className="bg-gradient-to-br from-[#0A75BB]/5 to-transparent border border-[#0A75BB]/15 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">
            {isInternational ? 'International Online Consultation' :
             consultationType === 'offline' ? 'In-Clinic Consultation' :
             consultationType === 'hospital' ? 'Hospital Consultation' :
             'Online Consultation'}
          </h3>
          {isInternational && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#0A75BB]/10 text-[#0A75BB] text-[10px] font-bold rounded-full">
              <Globe className="h-3 w-3" /> INTERNATIONAL
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500">Patient</p>
            <p className="font-semibold text-gray-900">{patientName}</p>
          </div>
          {patientCountry && (
            <div>
              <p className="text-xs text-gray-500">Country</p>
              <p className="font-semibold text-gray-900">{patientCountry}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Booking ID</p>
            <p className="font-semibold text-gray-900">{bookingId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="text-2xl font-bold text-[#0A75BB]">
              {displayCurrency === 'USD' ? '$' : '₹'}{displayAmount} <span className="text-xs font-medium text-gray-400">{displayCurrency}</span>
            </p>
          </div>
        </div>
      </div>

      {paymentStatus === 'success' ? (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</p>
          <p className="text-sm text-gray-500">Your appointment has been confirmed.</p>
        </div>
      ) : (
        <>
          {/* Payment Method Selection — UPI only for Indian patients */}
          {!isInternational && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMethod('razorpay')}
                className={cn(
                  'border-2 rounded-xl p-4 text-left transition-all',
                  selectedMethod === 'razorpay' ? 'border-[#0A75BB] bg-[#0A75BB]/5' : 'border-gray-200 hover:border-gray-300'
                )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Cards / UPI</p>
                    <p className="text-xs text-gray-500">Razorpay secure checkout</p>
                  </div>
                </div>
              </button>

              {pg.upiId && (
                <button
                  onClick={() => setSelectedMethod('upi-qr')}
                  className={cn(
                    'border-2 rounded-xl p-4 text-left transition-all',
                    selectedMethod === 'upi-qr' ? 'border-[#0A75BB] bg-[#0A75BB]/5' : 'border-gray-200 hover:border-gray-300'
                  )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Scan UPI QR</p>
                      <p className="text-xs text-gray-500">GPay, PhonePe, Paytm</p>
                    </div>
                  </div>
                </button>
              )}

              {pg.upiId && (
                <button
                  onClick={() => setSelectedMethod('upi-link')}
                  className={cn(
                    'border-2 rounded-xl p-4 text-left transition-all',
                    selectedMethod === 'upi-link' ? 'border-[#0A75BB] bg-[#0A75BB]/5' : 'border-gray-200 hover:border-gray-300'
                  )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">UPI Link</p>
                      <p className="text-xs text-gray-500">Open UPI app directly</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* International: Razorpay only (international cards) */}
          {isInternational && (
            <div className="bg-[#0A75BB]/5 border border-[#0A75BB]/20 rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-600 mb-3">
                International payments are processed securely via Razorpay. Credit/debit cards, PayPal and other
                international payment methods accepted where supported by your account.
              </p>
            </div>
          )}

          {/* Failure message */}
          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Payment was not completed</p>
                <p className="text-xs text-red-600 mt-0.5">{failureReason || 'Your booking has not been marked as paid.'}</p>
              </div>
            </div>
          )}

          {/* Razorpay Payment */}
          {selectedMethod === 'razorpay' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-4">
                {isInternational
                  ? 'Click below to open secure Razorpay checkout with international card and payment options.'
                  : 'Click below to open Razorpay checkout where you can pay via UPI, Credit/Debit Card, Netbanking, or Wallets.'}
              </p>
              <button
                onClick={handleRazorpayPayment}
                disabled={processing || !razorpayLoaded}
                className="w-full py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {processing ? 'Processing...' : `Pay ${displayCurrency === 'USD' ? '$' : '₹'}${displayAmount} ${displayCurrency}`}
              </button>
              {!razorpayLoaded && !processing && (
                <p className="text-xs text-amber-600 text-center mt-2">Loading secure checkout...</p>
              )}
            </div>
          )}

          {/* UPI QR Code */}
          {selectedMethod === 'upi-qr' && pg.upiId && !isInternational && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-600 mb-4">Scan this QR code with any UPI app to pay</p>
              <div className="bg-white border-2 border-gray-900 rounded-xl p-4 inline-block mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                  alt="UPI QR Code"
                  className="w-48 h-48"
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm text-gray-500">UPI ID:</span>
                <code className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{pg.upiId}</code>
                <button onClick={copyUPI} className="p-1 text-gray-400 hover:text-[#0A75BB] transition-colors" title="Copy UPI ID">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Amount: ₹{amount}</p>

              <button
                onClick={handleUPIQRPayment}
                disabled={processing}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {processing ? 'Verifying...' : 'I have paid — Confirm Payment'}
              </button>
            </div>
          )}

          {/* UPI Link */}
          {selectedMethod === 'upi-link' && pg.upiId && !isInternational && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-4">Tap the button below to open your UPI app directly</p>
              <a
                href={upiLink}
                onClick={() => {
                  setProcessing(true);
                  setPaymentStatus('processing');
                  setTimeout(() => {
                    const pd: PaymentData = {
                      paymentId: `upi-link-${Date.now()}`,
                      method: 'upi-link',
                      amount,
                      currency: 'INR',
                      status: 'paid',
                      timestamp: new Date().toISOString(),
                    };
                    setPaymentStatus('success');
                    setProcessing(false);
                    onPaymentSuccess(pd);
                  }, 5000);
                }}
                className="block w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-center">
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Open UPI App to Pay ₹{amount}
                </div>
              </a>
              <p className="text-xs text-gray-400 text-center mt-3">Opens GPay, PhonePe, Paytm, or any UPI app</p>
            </div>
          )}
        </>
      )}

      {/* Skip Payment — only shown if payment not strictly required */}
      {false && paymentStatus !== 'success' && (
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onSkipPayment} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
            {isInternational ? 'Pay later — continue without payment' : 'Skip payment for now'}
          </button>
        </div>
      )}
    </div>
  );
}