import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CheckoutState {
  reference: string | null;
  status: 'idle' | 'pending' | 'verifying' | 'success' | 'failed';
  amount: number;
  gateway: 'flutterwave' | 'paystack' | '';
  customerEmail: string;
  customerName: string;
  paymentType: 'deposit' | 'full';
  setCheckoutData: (data: Partial<CheckoutState>) => void;
  resetCheckout: () => void;
}

const initialState: Omit<CheckoutState, 'setCheckoutData' | 'resetCheckout'> = {
  reference: null,
  status: 'idle',
  amount: 0,
  gateway: '',
  customerEmail: '',
  customerName: '',
  paymentType: 'deposit',
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,
      setCheckoutData: (data) => set((state) => ({ ...state, ...data })),
      resetCheckout: () => set(initialState),
    }),
    {
      name: 'kadiv-checkout',
      partialize: (state) => ({
        reference: state.reference,
        status: state.status,
        amount: state.amount,
        gateway: state.gateway,
        customerEmail: state.customerEmail,
        customerName: state.customerName,
        paymentType: state.paymentType,
      }),
    }
  )
);