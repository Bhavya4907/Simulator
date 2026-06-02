import { create } from "zustand";

export interface Message {
  id?: string;
  character_id: string;
  sender: "user" | "bot";
  content: string;
  created_at?: string;
}

export interface Character {
  id: string;
  name: string;
  personality: string;
  backstory: string;
  mood: string;
  relationship_score: number;
}

interface ChatState {
  character: Character | null;
  messages: Message[];
  isTyping: boolean;
  setCharacter: (character: Character) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateCharacterState: (mood: string, relationship_score: number) => void;
  setIsTyping: (val: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  character: null,
  messages: [],
  isTyping: false,
  setCharacter: (character) => set({ character }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateCharacterState: (mood, relationship_score) =>
    set((state) => ({
      character: state.character
        ? { ...state.character, mood, relationship_score }
        : null,
    })),
  setIsTyping: (val) => set({ isTyping: val }),
  reset: () => set({ character: null, messages: [], isTyping: false }),
}));