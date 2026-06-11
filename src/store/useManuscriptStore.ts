import { create } from 'zustand';

export interface Chapter {
  _id?: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  status: 'outline' | 'draft' | 'revised' | 'final';
  generatedAt?: string;
}

export interface Manuscript {
  _id: string;
  authorId: string;
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  bookType: string;
  chapters: Chapter[];
  outline: string;
  status: 'planning' | 'drafting' | 'revising' | 'complete';
  createdAt: string;
  updatedAt: string;
}

interface ManuscriptState {
  manuscripts: Manuscript[];
  currentManuscript: Manuscript | null;
  activeChapterIndex: number;
  loading: boolean;
  generating: boolean;
  error: string | null;

  fetchManuscripts: (authorId: string) => Promise<void>;
  fetchManuscript: (id: string) => Promise<void>;
  createManuscript: (data: Partial<Manuscript>) => Promise<Manuscript | null>;
  updateManuscript: (id: string, data: Partial<Manuscript>) => Promise<void>;
  deleteManuscript: (id: string) => Promise<void>;
  generateOutline: (id: string) => Promise<void>;
  generateChapter: (id: string, chapterNumber: number) => Promise<void>;
  setActiveChapter: (index: number) => void;
  updateChapterContent: (id: string, chapterIndex: number, content: string) => Promise<void>;
  setCurrentManuscript: (manuscript: Manuscript | null) => void;
  clearError: () => void;
}

export const useManuscriptStore = create<ManuscriptState>((set, get) => ({
  manuscripts: [],
  currentManuscript: null,
  activeChapterIndex: 0,
  loading: false,
  generating: false,
  error: null,

  fetchManuscripts: async (authorId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/manuscripts?authorId=${authorId}`);
      if (!res.ok) throw new Error('Failed to fetch manuscripts');
      const data = await res.json();
      set({ manuscripts: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchManuscript: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/manuscripts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch manuscript');
      const data = await res.json();
      set({ currentManuscript: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createManuscript: async (data: Partial<Manuscript>) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create manuscript');
      const manuscript = await res.json();
      set((state) => ({
        manuscripts: [...state.manuscripts, manuscript],
        loading: false,
      }));
      return manuscript;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      return null;
    }
  },

  updateManuscript: async (id: string, data: Partial<Manuscript>) => {
    try {
      const res = await fetch(`/api/manuscripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update manuscript');
      const updated = await res.json();
      set((state) => ({
        currentManuscript: state.currentManuscript?._id === id ? updated : state.currentManuscript,
        manuscripts: state.manuscripts.map((m) => (m._id === id ? updated : m)),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteManuscript: async (id: string) => {
    try {
      const res = await fetch(`/api/manuscripts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete manuscript');
      set((state) => ({
        manuscripts: state.manuscripts.filter((m) => m._id !== id),
        currentManuscript: state.currentManuscript?._id === id ? null : state.currentManuscript,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  generateOutline: async (id: string) => {
    set({ generating: true, error: null });
    try {
      const res = await fetch(`/api/manuscripts/${id}/generate-outline`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate outline');
      const updated = await res.json();
      set((state) => ({
        currentManuscript: updated,
        manuscripts: state.manuscripts.map((m) => (m._id === id ? updated : m)),
        generating: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, generating: false });
    }
  },

  generateChapter: async (id: string, chapterNumber: number) => {
    set({ generating: true, error: null });
    try {
      const res = await fetch(`/api/manuscripts/${id}/generate-chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterNumber }),
      });
      if (!res.ok) throw new Error('Failed to generate chapter');
      const updated = await res.json();
      set((state) => ({
        currentManuscript: updated,
        manuscripts: state.manuscripts.map((m) => (m._id === id ? updated : m)),
        generating: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, generating: false });
    }
  },

  setActiveChapter: (index: number) => set({ activeChapterIndex: index }),

  updateChapterContent: async (id: string, chapterIndex: number, content: string) => {
    const { currentManuscript } = get();
    if (!currentManuscript) return;

    const updatedChapters = [...currentManuscript.chapters];
    updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], content };

    try {
      const res = await fetch(`/api/manuscripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters: updatedChapters }),
      });
      if (!res.ok) throw new Error('Failed to update chapter');
      const updated = await res.json();
      set((state) => ({
        currentManuscript: updated,
        manuscripts: state.manuscripts.map((m) => (m._id === id ? updated : m)),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setCurrentManuscript: (manuscript) => set({ currentManuscript: manuscript }),
  clearError: () => set({ error: null }),
}));
