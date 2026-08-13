// ============================================================
// Consultation Pricing Configuration
// Centralized so prices can be changed in one place.
// ============================================================

export type ConsultationPricing = {
  amount: number;      // amount in major units (500 = ₹500, 25 = $25)
  currency: string;    // INR or USD
  label: string;       // human-readable label
};

const PRICING: Record<string, ConsultationPricing> = {
  online: { amount: 500, currency: 'INR', label: 'Indian Online Consultation' },
  online_intl: { amount: 25, currency: 'USD', label: 'International Online Consultation' },
  offline: { amount: 500, currency: 'INR', label: 'In-Clinic Consultation' },
  hospital: { amount: 1000, currency: 'INR', label: 'Hospital Consultation' },
};

// Default fallback (used when consultation type is unknown)
const DEFAULT_PRICING: ConsultationPricing = { amount: 500, currency: 'INR', label: 'Online Consultation' };

export function getConsultationPricing(consultationType?: string | null): ConsultationPricing {
  if (consultationType && PRICING[consultationType]) return PRICING[consultationType];
  return DEFAULT_PRICING;
}

export function isInternationalConsultation(consultationType?: string | null): boolean {
  return consultationType === 'online_intl';
}

export function formatPricing(pricing: ConsultationPricing): string {
  return pricing.currency === 'USD' ? `$${pricing.amount} USD` : `₹${pricing.amount}`;
}

// Razorpay amounts must be in smallest currency unit (paise / cents)
export function toRazorpayAmount(pricing: ConsultationPricing): number {
  return pricing.amount * 100;
}

export { PRICING };