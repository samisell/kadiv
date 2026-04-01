import { create } from 'zustand';

interface BlogState {
  selectedPostId: number | null;
  selectPost: (id: number) => void;
  clearPost: () => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  selectedPostId: null,
  selectPost: (id) => set({ selectedPostId: id }),
  clearPost: () => set({ selectedPostId: null }),
}));
