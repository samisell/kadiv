import { create } from 'zustand';

export type Page = 
  | 'home'
  | 'about'
  | 'services'
  | 'events'
  | 'calculator'
  | 'booking'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
  | 'reset-password'
  | 'dashboard'
  | 'gallery'
  | 'contact'
  | 'blog'
  | 'blog-detail'
  | 'admin'
  | 'checkout'
  | 'payment-result'
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'faq';

interface NavigationState {
  currentPage: Page;
  previousPage: Page | null;
  navigate: (page: Page) => void;
  goBack: () => void;
}

/* ─── Valid page values for hash lookup ─── */
const VALID_PAGES: readonly Page[] = [
  'home','about','services','events','calculator','booking',
  'login','register','forgot-password','verify-email','reset-password',
  'dashboard','gallery','contact','blog','blog-detail','admin','checkout',
  'payment-result','terms','privacy','refund','faq',
];

/** Read window.location.hash and return a valid Page, or null */
function pageFromHash(): Page | null {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return null;
  return (VALID_PAGES as readonly string[]).includes(hash) ? (hash as Page) : null;
}

export const useNavigation = create<NavigationState>((set, get) => ({
  currentPage: 'home',
  previousPage: null,
  navigate: (page: Page) => {
    const current = get().currentPage;
    set({ previousPage: current, currentPage: page });
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  goBack: () => {
    const { previousPage } = get();
    if (previousPage) {
      set({ currentPage: previousPage, previousPage: null });
      window.location.hash = previousPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
}));

/**
 * Initialise the navigation store from the current URL hash.
 * Call once on app mount.
 */
export function initFromHash() {
  const page = pageFromHash();
  if (page && page !== useNavigation.getState().currentPage) {
    useNavigation.getState().navigate(page);
  }
}

/**
 * Handle the browser `hashchange` event so the store stays in sync
 * when the user navigates via browser back/forward buttons.
 */
export function handleHashChange() {
  const page = pageFromHash();
  if (page) {
    const current = useNavigation.getState().currentPage;
    if (page !== current) {
      useNavigation.setState({ previousPage: current, currentPage: page });
    }
  }
}
