'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, X, Loader2, AlertTriangle, Globe } from 'lucide-react';
import { getConsultationPricing } from '@/lib/pricing';

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
  method: 'razorpay';
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  timestamp: string;
  orderId?: string;
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
}: PaymentGatewayProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [failureReason, setFailureReason] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const pricing = getConsultationPricing(consultationType);
  const displayAmount = amount || pricing.amount;
  const displayCurrency = currency || pricing.currency;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setRazorpayLoaded(false);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
        amount: displayAmount,
        currency: displayCurrency,
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
    } catch (e) {
      setProcessing(false);
      setPaymentStatus('failed');
      const msg = e instanceof Error ? e.message : 'Failed to create payment order';
      setFailureReason(msg);
      onPaymentFailed(msg);
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
          const msg = e instanceof Error ? e.message : 'Payment could not be verified';
          setFailureReason(msg);
          onPaymentFailed(msg);
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
        const msg = response.error?.description || 'Payment failed';
        setFailureReason(msg);
        onPaymentFailed(msg);
      });
      rzp.open();
    } catch {
      setProcessing(false);
      setPaymentStatus('failed');
      setFailureReason('Failed to open Razorpay checkout');
      onPaymentFailed('Failed to open Razorpay checkout');
    }
  };

  return (
    <div className="space-y-5">
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
          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Payment was not completed</p>
                <p className="text-xs text-red-600 mt-0.5">{failureReason || 'Your booking has not been marked as paid.'}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Secure Payment via Razorpay</p>
                <p className="text-xs text-gray-500">UPI, Credit/Debit Card, Netbanking, Wallets</p>
              </div>
            </div>
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
        </>
      )}
    </div>
  );
}
