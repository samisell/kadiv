/**
 * Currency formatting utilities and Nigerian event location data.
 * All base prices in the app are stored in Nigerian Naira (NGN).
 * Use the useCurrency() hook in React components to format amounts
 * that reactively switch between NGN and USD.
 */

import { useCurrencyStore, CURRENCY_META, type Currency } from '@/store/currencyStore';

// Re-export for components that need direct access
export { CURRENCY_META, type Currency };
export { useCurrencyStore } from '@/store/currencyStore';

/* ─── Nigerian Event Locations ─── */
export interface LocationOption {
  value: string;
  label: string;
}

export interface LocationGroup {
  group: string;
  locations: LocationOption[];
}

export const EVENT_LOCATIONS: LocationGroup[] = [
  {
    group: 'Lagos',
    locations: [
      { value: 'lagos-vi', label: 'Victoria Island (VI)' },
      { value: 'lagos-lekki', label: 'Lekki' },
      { value: 'lagos-lekki-phase1', label: 'Lekki Phase 1' },
      { value: 'lagos-ajah', label: 'Ajah' },
      { value: 'lagos-ikeja', label: 'Ikeja' },
      { value: 'lagos-mainland', label: 'Mainland' },
      { value: 'lagos-surulere', label: 'Surulere' },
      { value: 'lagos-yaba', label: 'Yaba' },
      { value: 'lagos-banana-island', label: 'Banana Island' },
      { value: 'lagos-ikoyi', label: 'Ikoyi' },
    ],
  },
  {
    group: 'Other Cities',
    locations: [
      { value: 'abuja', label: 'Abuja (FCT)' },
      { value: 'port-harcourt', label: 'Port Harcourt' },
      { value: 'ibadan', label: 'Ibadan' },
      { value: 'enugu', label: 'Enugu' },
      { value: 'benin', label: 'Benin City' },
      { value: 'calabar', label: 'Calabar' },
      { value: 'owerri', label: 'Owerri' },
      { value: 'uyo', label: 'Uyo' },
      { value: 'asaba', label: 'Asaba' },
      { value: 'aba', label: 'Aba' },
    ],
  },
];

/* ─── Plain formatting (non-reactive, reads store snapshot) ─── */

export function formatCurrency(amountInNGN: number): string {
  const { currency, rate } = useCurrencyStore.getState();
  return formatAmount(amountInNGN, currency, rate);
}

export function getCurrencySymbol(): string {
  return CURRENCY_META[useCurrencyStore.getState().currency].symbol;
}

/* ─── Internal formatter ─── */
function formatAmount(amountInNGN: number, currency: Currency, rate: number): string {
  const config = CURRENCY_META[currency];
  const amount = currency === 'USD' ? amountInNGN / rate : amountInNGN;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─── React hook (reactive — triggers re-render on currency change) ─── */

export function useCurrency() {
  const { currency, rate, setCurrency } = useCurrencyStore();
  const config = CURRENCY_META[currency];

  const format = (amountInNGN: number): string => {
    return formatAmount(amountInNGN, currency, rate);
  };

  const formatShort = (amountInNGN: number): string => {
    const amount = currency === 'USD' ? amountInNGN / rate : amountInNGN;
    if (currency === 'NGN') {
      if (amount >= 1_000_000_000) return `${config.symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
      if (amount >= 1_000_000) return `${config.symbol}${(amount / 1_000_000).toFixed(1)}M`;
      if (amount >= 1_000) return `${config.symbol}${(amount / 1_000).toFixed(0)}K`;
    }
    if (currency === 'USD') {
      if (amount >= 1_000_000) return `${config.symbol}${(amount / 1_000_000).toFixed(1)}M`;
      if (amount >= 1_000) return `${config.symbol}${(amount / 1_000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    currency,
    rate,
    setCurrency,
    symbol: config.symbol,
    code: config.code,
    name: config.name,
    format,
    formatShort,
  };
}
