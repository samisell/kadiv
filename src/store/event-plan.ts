import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface EventPlan {
  eventType: string;
  guestCount: number;
  venueType: string;
  cateringPackage: string;
  services: ServiceItem[];
  addOns: ServiceItem[];
  date?: string;
  location?: string;
  notes?: string;
}

interface EventPlanState {
  plan: EventPlan;
  setEventType: (type: string) => void;
  setGuestCount: (count: number) => void;
  setVenueType: (type: string) => void;
  setCateringPackage: (pkg: string) => void;
  addService: (service: ServiceItem) => void;
  removeService: (id: string) => void;
  updateServiceQuantity: (id: string, quantity: number) => void;
  addAddOn: (addOn: ServiceItem) => void;
  removeAddOn: (id: string) => void;
  setDate: (date: string) => void;
  setLocation: (location: string) => void;
  setNotes: (notes: string) => void;
  resetPlan: () => void;
  getTotal: () => number;
  getBreakdown: () => { label: string; cost: number }[];
}

const defaultPlan: EventPlan = {
  eventType: '',
  guestCount: 50,
  venueType: '',
  cateringPackage: '',
  services: [],
  addOns: [],
};

export const useEventPlan = create<EventPlanState>()(
  persist(
    (set, get) => ({
      plan: defaultPlan,
      setEventType: (eventType) => set((s) => ({ plan: { ...s.plan, eventType } })),
      setGuestCount: (guestCount) => set((s) => ({ plan: { ...s.plan, guestCount } })),
      setVenueType: (venueType) => set((s) => ({ plan: { ...s.plan, venueType } })),
      setCateringPackage: (cateringPackage) => set((s) => ({ plan: { ...s.plan, cateringPackage } })),
      addService: (service) =>
        set((s) => {
          const exists = s.plan.services.find((i) => i.id === service.id);
          if (exists) return s;
          return { plan: { ...s.plan, services: [...s.plan.services, service] } };
        }),
      removeService: (id) =>
        set((s) => ({
          plan: { ...s.plan, services: s.plan.services.filter((i) => i.id !== id) },
        })),
      updateServiceQuantity: (id, quantity) =>
        set((s) => ({
          plan: {
            ...s.plan,
            services: s.plan.services.map((i) => (i.id === id ? { ...i, quantity } : i)),
          },
        })),
      addAddOn: (addOn) =>
        set((s) => {
          const exists = s.plan.addOns.find((i) => i.id === addOn.id);
          if (exists) return s;
          return { plan: { ...s.plan, addOns: [...s.plan.addOns, addOn] } };
        }),
      removeAddOn: (id) =>
        set((s) => ({
          plan: { ...s.plan, addOns: s.plan.addOns.filter((i) => i.id !== id) },
        })),
      setDate: (date) => set((s) => ({ plan: { ...s.plan, date } })),
      setLocation: (location) => set((s) => ({ plan: { ...s.plan, location } })),
      setNotes: (notes) => set((s) => ({ plan: { ...s.plan, notes } })),
      resetPlan: () => set({ plan: defaultPlan }),
      getTotal: () => {
        const { plan } = get();
        const venuePrices: Record<string, number> = {
          'ballroom': 2000000,
          'garden': 1500000,
          'beach': 5000000,
          'rooftop': 3000000,
          'indoor-hall': 1000000,
        };
        const cateringPrices: Record<string, number> = {
          'basic': 7500,
          'premium': 15000,
          'luxury': 30000,
          'platinum': 50000,
        };
        let total = 0;
        total += venuePrices[plan.venueType] || 0;
        total += (cateringPrices[plan.cateringPackage] || 0) * plan.guestCount;
        plan.services.forEach((s) => (total += s.price * s.quantity));
        plan.addOns.forEach((a) => (total += a.price * a.quantity));
        return total;
      },
      getBreakdown: () => {
        const { plan } = get();
        const breakdown: { label: string; cost: number }[] = [];
        const venueNames: Record<string, string> = {
          'ballroom': 'Ballroom Venue',
          'garden': 'Garden Venue',
          'beach': 'Beach Venue',
          'rooftop': 'Rooftop Venue',
          'indoor-hall': 'Indoor Hall',
        };
        const venuePrices: Record<string, number> = {
          'ballroom': 2000000,
          'garden': 1500000,
          'beach': 5000000,
          'rooftop': 3000000,
          'indoor-hall': 1000000,
        };
        const cateringNames: Record<string, string> = {
          'basic': 'Basic Catering',
          'premium': 'Premium Catering',
          'luxury': 'Luxury Catering',
          'platinum': 'Platinum Catering',
        };
        const cateringPrices: Record<string, number> = {
          'basic': 7500,
          'premium': 15000,
          'luxury': 30000,
          'platinum': 50000,
        };
        if (plan.venueType && venuePrices[plan.venueType]) {
          breakdown.push({ label: venueNames[plan.venueType], cost: venuePrices[plan.venueType] });
        }
        if (plan.cateringPackage && cateringPrices[plan.cateringPackage]) {
          breakdown.push({
            label: `${cateringNames[plan.cateringPackage]} (${plan.guestCount} guests)`,
            cost: cateringPrices[plan.cateringPackage] * plan.guestCount,
          });
        }
        plan.services.forEach((s) =>
          breakdown.push({ label: `${s.name} x${s.quantity}`, cost: s.price * s.quantity }),
        );
        plan.addOns.forEach((a) =>
          breakdown.push({ label: `${a.name} x${a.quantity}`, cost: a.price * a.quantity }),
        );
        return breakdown;
      },
    }),
    { name: 'kadiv-event-plan' }
  )
);
