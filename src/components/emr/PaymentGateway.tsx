'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Smartphone, CheckCircle2, X, Loader2, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadBookingSettings } from '@/lib/booking-settings';

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  bookingId: string;
  patientName: string;
  patientPhone: string;
  consultationType: string;
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
  consultationType,
  onPaymentSuccess,
  onPaymentFailed,
  onSkipPayment,
}: PaymentGatewayProps) {
  const [settings] = useState(() => loadBookingSettings());
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'upi-qr' | 'upi-link'>('upi-qr');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const pg = settings.paymentGateway;

  useEffect(() => {
    if (pg.provider === 'razorpay' && pg.razorpayKeyId) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setRazorpayLoaded(false);
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    }
  }, [pg.provider, pg.razorpayKeyId]);

  const handleRazorpayPayment = () => {
    if (!pg.razorpayKeyId || !(window as any).Razorpay) {
      onPaymentFailed('Razorpay not loaded. Please try UPI.');
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');

    const options = {
      key: pg.razorpayKeyId,
      amount: amount * 100,
      currency: currency || 'INR',
      name: 'Kidney Care Centre',
      description: `Consultation - ${bookingId}`,
      handler: function (response: any) {
        const paymentData: PaymentData = {
          paymentId: response.razorpay_payment_id,
          method: 'razorpay',
          amount,
          currency: currency || 'INR',
          status: 'paid',
          timestamp: new Date().toISOString(),
        };
        setPaymentStatus('success');
        setProcessing(false);
        onPaymentSuccess(paymentData);
      },
      prefill: {
        name: patientName,
        contact: patientPhone,
      },
      theme: {
        color: '#0A75BB',
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
          setPaymentStatus('failed');
          onPaymentFailed('Payment cancelled by user');
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setProcessing(false);
        setPaymentStatus('failed');
        onPaymentFailed(response.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch {
      setProcessing(false);
      setPaymentStatus('failed');
      onPaymentFailed('Failed to open Razorpay checkout');
    }
  };

  const handleUPIQRPayment = () => {
    setProcessing(true);
    setPaymentStatus('processing');
    // UPI QR is manual verification — patient scans and pays, doctor verifies
    // Auto-confirm after 30 seconds for demo
    setTimeout(() => {
      const paymentData: PaymentData = {
        paymentId: `upi-${Date.now()}`,
        method: 'upi-qr',
        amount,
        currency: currency || 'INR',
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
        <p className="text-sm text-gray-500 mt-1">Please pay ₹{amount} when you visit the clinic</p>
        <button onClick={onSkipPayment} className="mt-4 px-6 py-2.5 bg-[#0A75BB] text-white rounded-xl text-sm font-semibold hover:bg-[#085a94] transition-colors">
          Continue Without Payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Complete Payment</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#0A75BB]">{currency === 'USD' ? '$' : '₹'}{amount}</p>
          <p className="text-xs text-gray-500">{consultationType}</p>
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
          {/* Payment Method Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pg.provider === 'razorpay' && razorpayLoaded && (
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
                    <p className="font-semibold text-gray-900 text-sm">Pay with Razorpay</p>
                    <p className="text-xs text-gray-500">Cards, UPI, Netbanking, Wallets</p>
                  </div>
                </div>
              </button>
            )}

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
                    <p className="text-xs text-gray-500">GPay, PhonePe, Paytm, any UPI app</p>
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
                    <p className="text-xs text-gray-500">Tap to open UPI app directly</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Razorpay Payment */}
          {selectedMethod === 'razorpay' && pg.provider === 'razorpay' && razorpayLoaded && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-4">Click below to open Razorpay checkout where you can pay via UPI, Credit/Debit Card, Netbanking, or Wallets.</p>
              <button
                onClick={handleRazorpayPayment}
                disabled={processing}
                className="w-full py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {processing ? 'Opening...' : `Pay ${currency === 'USD' ? '$' : '₹'}${amount} via Razorpay`}
              </button>
            </div>
          )}

          {/* UPI QR Code */}
          {selectedMethod === 'upi-qr' && pg.upiId && (
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
              <p className="text-xs text-gray-400 mb-4">Amount: {currency === 'USD' ? '$' : '₹'}{amount}</p>

              {processing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for payment confirmation...
                  </div>
                </div>
              )}

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
          {selectedMethod === 'upi-link' && pg.upiId && (
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
                      currency: currency || 'INR',
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
                  <ExternalLink className="h-4 w-4" /> Open UPI App to Pay {currency === 'USD' ? '$' : '₹'}{amount}
                </div>
              </a>
              <p className="text-xs text-gray-400 text-center mt-3">Opens GPay, PhonePe, Paytm, or any UPI app</p>
            </div>
          )}
        </>
      )}

      {/* Skip Payment (for demo) */}
      {paymentStatus !== 'success' && (
        <div className="border-t border-gray-100 pt-4">
          <button onClick={onSkipPayment} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
            Skip payment for now (demo)
          </button>
        </div>
      )}
    </div>
  );
}
