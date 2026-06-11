import { create } from 'zustand';

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  loading: boolean;
  streaming: boolean;
  error: string | null;

  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string, authorId: string, manuscriptId?: string) => Promise<void>;
  loadMessages: (authorId: string, manuscriptId?: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  loading: false,
  streaming: false,
  error: null,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  loadMessages: async (authorId: string, manuscriptId?: string) => {
    set({ loading: true, error: null });
    try {
      const url = manuscriptId
        ? `/api/chat?authorId=${authorId}&manuscriptId=${manuscriptId}`
        : `/api/chat?authorId=${authorId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      set({ messages: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  sendMessage: async (content: string, authorId: string, manuscriptId?: string) => {
    const userMessage: ChatMessage = { role: 'user', content, createdAt: new Date().toISOString() };
    set((state) => ({
      messages: [...state.messages, userMessage],
      streaming: true,
      error: null,
    }));

    try {
      const { messages } = get();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId,
          manuscriptId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add empty assistant message that we'll stream into
      set((state) => ({
        messages: [...state.messages, { role: 'assistant', content: '', createdAt: new Date().toISOString() }],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        // Update the last message with accumulated content
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: assistantContent };
          return { messages: msgs };
        });
      }

      set({ streaming: false });
    } catch (err) {
      set({ error: (err as Error).message, streaming: false });
    }
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));
