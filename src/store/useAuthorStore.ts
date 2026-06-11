import { create } from 'zustand';

interface VoiceProfile {
  toneDescriptors: string[];
  signaturePhrases: string[];
  anchorScriptures: string[];
  writingStyle: string;
  audienceDescription: string;
  personalTestimony: string;
  theologicalFramework: string;
  avoidTopics: string[];
  preferredBibleVersion: string;
}

export interface Author {
  _id: string;
  name: string;
  ministry: string;
  theologicalStream: string;
  voiceProfile: VoiceProfile;
  interviewCompleted: boolean;
  interviewStep: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthorState {
  authors: Author[];
  currentAuthor: Author | null;
  loading: boolean;
  error: string | null;

  fetchAuthors: () => Promise<void>;
  fetchAuthor: (id: string) => Promise<void>;
  createAuthor: (name: string) => Promise<Author | null>;
  updateAuthor: (id: string, data: Partial<Author>) => Promise<void>;
  deleteAuthor: (id: string) => Promise<void>;
  saveInterviewStep: (id: string, step: number, data: Record<string, unknown>) => Promise<void>;
  setCurrentAuthor: (author: Author | null) => void;
  clearError: () => void;
}

export const useAuthorStore = create<AuthorState>((set, get) => ({
  authors: [],
  currentAuthor: null,
  loading: false,
  error: null,

  fetchAuthors: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/authors');
      if (!res.ok) throw new Error('Failed to fetch authors');
      const data = await res.json();
      set({ authors: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchAuthor: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/authors/${id}`);
      if (!res.ok) throw new Error('Failed to fetch author');
      const data = await res.json();
      set({ currentAuthor: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createAuthor: async (name: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create author');
      const data = await res.json();
      set((state) => ({
        authors: [...state.authors, data],
        currentAuthor: data,
        loading: false,
      }));
      return data;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      return null;
    }
  },

  updateAuthor: async (id: string, data: Partial<Author>) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update author');
      const updated = await res.json();
      set((state) => ({
        currentAuthor: updated,
        authors: state.authors.map((a) => (a._id === id ? updated : a)),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  deleteAuthor: async (id: string) => {
    try {
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete author');
      set((state) => ({
        authors: state.authors.filter((a) => a._id !== id),
        currentAuthor: state.currentAuthor?._id === id ? null : state.currentAuthor,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  saveInterviewStep: async (id: string, step: number, data: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/authors/${id}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      });
      if (!res.ok) throw new Error('Failed to save interview step');
      const updated = await res.json();
      set({ currentAuthor: updated, loading: false });
      // Also update the authors list
      const { authors } = get();
      set({ authors: authors.map((a) => (a._id === id ? updated : a)) });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setCurrentAuthor: (author) => set({ currentAuthor: author }),
  clearError: () => set({ error: null }),
}));
