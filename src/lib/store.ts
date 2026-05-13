import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page =
  | 'blog'
  | 'dashboard'
  | 'posts'
  | 'categories'
  | 'editor'
  | 'article';

interface AppState {
  // Navigation
  currentPage: Page;
  previousPage: Page | null;
  navigate: (page: Page) => void;
  goBack: () => void;

  // Editor state
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;

  // Article view state
  viewingPostId: string | null;
  setViewingPostId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Category filter
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;

  // User / Auth
  user: { id: string; name: string; email: string; avatar?: string | null } | null;
  setUser: (user: AppState['user']) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;

  // Toast
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: 'blog',
      previousPage: null,
      navigate: (page) => set({ previousPage: get().currentPage, currentPage: page }),
      goBack: () => {
        const { previousPage } = get();
        if (previousPage) {
          set({ currentPage: previousPage, previousPage: null });
        } else {
          set({ currentPage: 'blog' });
        }
      },

      editingPostId: null,
      setEditingPostId: (id) => set({ editingPostId: id }),

      viewingPostId: null,
      setViewingPostId: (id) => set({ viewingPostId: id }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      selectedCategoryId: null,
      setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

      user: null,
      setUser: (user) => set({ user }),
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      toastMessage: null,
      toastType: 'success',
      showToast: (message, type = 'success') =>
        set({ toastMessage: message, toastType: type }),
      clearToast: () => set({ toastMessage: null }),
    }),
    {
      name: 'inkwell-storage',
      partialize: (state) => ({ isAdmin: state.isAdmin }),
    }
  )
);