import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'NGN' | 'USD';

export const CURRENCY_META: Record<Currency, { symbol: string; code: string; name: string; locale: string }> = {
  NGN: { symbol: '₦', code: 'NGN', name: 'Nigerian Naira', locale: 'en-NG' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', locale: 'en-US' },
};

export const DEFAULT_RATE = 1550; // 1 USD = 1,550 NGN

interface CurrencyState {
  currency: Currency;
  rate: number;
  setCurrency: (currency: Currency) => void;
  setRate: (rate: number) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'NGN',
      rate: DEFAULT_RATE,
      setCurrency: (currency) => set({ currency }),
      setRate: (rate) => set({ rate }),
    }),
    { name: 'kadiv-currency' }
  )
);
