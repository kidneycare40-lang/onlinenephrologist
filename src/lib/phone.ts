// ============================================================
// Centralized phone normalization, validation, and country detection.
// Used by booking, login, WhatsApp, EMR, and account creation.
// All phone storage MUST go through normalizePhone().
// ============================================================

const COUNTRY_CODES: Record<string, string> = {
  'IN': '+91', 'US': '+1', 'GB': '+44', 'AU': '+61', 'CA': '+1',
  'AE': '+971', 'SA': '+966', 'SG': '+65', 'MY': '+60', 'BD': '+880',
  'NP': '+977', 'LK': '+94', 'NG': '+234', 'KE': '+254', 'DE': '+49',
  'FR': '+33', 'JP': '+81', 'PH': '+63', 'PK': '+92', 'EG': '+20',
  'TR': '+90', 'ZA': '+27', 'NZ': '+64', 'IE': '+353', 'NL': '+31',
};

export function stripPhone(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let stripped = stripPhone(phone);
  if (!stripped) return null;
  stripped = stripped.replace(/^0+/, '');

  if (stripped.length >= 12 && stripped.startsWith('91')) {
    const afterCode = stripped.substring(2);
    if (afterCode.length === 10 && /^[6-9]\d{9}$/.test(afterCode)) {
      return `+91${afterCode}`;
    }
  }

  if (stripped.length === 10 && /^[6-9]\d{9}$/.test(stripped)) {
    return `+91${stripped}`;
  }

  if (phone.trim().startsWith('+')) {
    return `+${stripped}`;
  }

  if (stripped.length >= 12) {
    return `+${stripped}`;
  }

  if (stripped.length === 10) {
    return `+91${stripped}`;
  }

  return `+${stripped}`;
}

export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  return /^\+[1-9]\d{6,14}$/.test(normalized);
}

export function getCountryFromPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const digits = normalized.substring(1);

  if (digits.startsWith('91') && digits.length === 12) return 'IN';
  if (digits.startsWith('1') && digits.length === 11) return 'US';
  if (digits.startsWith('44') && digits.length === 12) return 'GB';
  if (digits.startsWith('61') && digits.length === 12) return 'AU';
  if (digits.startsWith('971') && digits.length === 12) return 'AE';
  if (digits.startsWith('966') && digits.length === 12) return 'SA';
  if (digits.startsWith('65') && digits.length === 11) return 'SG';
  if (digits.startsWith('880') && digits.length === 13) return 'BD';
  if (digits.startsWith('977') && digits.length === 12) return 'NP';
  if (digits.startsWith('234') && digits.length === 13) return 'NG';
  if (digits.startsWith('254') && digits.length === 12) return 'KE';
  if (digits.startsWith('49') && digits.length === 12) return 'DE';
  if (digits.startsWith('33') && digits.length === 11) return 'FR';
  if (digits.startsWith('81') && digits.length === 11) return 'JP';
  return null;
}

export function getDialCode(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const country = getCountryFromPhone(phone);
  if (country && COUNTRY_CODES[country]) return COUNTRY_CODES[country];
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const digits = normalized.substring(1);
  if (digits.startsWith('91')) return '+91';
  if (digits.startsWith('1')) return '+1';
  if (digits.startsWith('44')) return '+44';
  if (digits.startsWith('61')) return '+61';
  if (digits.startsWith('971')) return '+971';
  return null;
}

export function getCountryCodeFromName(countryName: string): string | null {
  const lower = (countryName || '').trim().toLowerCase();
  const map: Record<string, string> = {
    'india': 'IN', 'united states': 'US', 'usa': 'US', 'united kingdom': 'GB',
    'uk': 'GB', 'australia': 'AU', 'canada': 'CA', 'uae': 'AE',
    'saudi arabia': 'SA', 'singapore': 'SG', 'malaysia': 'MY',
    'bangladesh': 'BD', 'nepal': 'NP', 'sri lanka': 'LK', 'nigeria': 'NG',
    'kenya': 'KE', 'germany': 'DE', 'france': 'FR', 'japan': 'JP',
    'philippines': 'PH', 'pakistan': 'PK', 'egypt': 'EG', 'turkey': 'TR',
    'south africa': 'ZA', 'new zealand': 'NZ', 'ireland': 'IE', 'netherlands': 'NL',
  };
  return map[lower] || null;
}

export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  const dialCode = getDialCode(normalized);
  const local = dialCode ? normalized.substring(dialCode.length) : normalized;
  if (dialCode === '+91' && local.length === 10) {
    return `+91 ${local.substring(0, 5)} ${local.substring(5)}`;
  }
  return `${dialCode || ''} ${local}`;
}
