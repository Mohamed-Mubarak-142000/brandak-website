/** Store-assistant shapes (brandak backend docs/assistant-api.md). */

export type AssistantTone = 'friendly' | 'formal' | 'brief';

export interface AssistantSettings {
  enabled: boolean;
  name: string;
  tone: AssistantTone;
  extraInfo: string;
  /** The name customers see (the owner's, or «مساعد {store}» when empty). */
  displayName: string;
  /** The AI is configured on the server. */
  available: boolean;
}

export interface AssistantStats {
  today: { used: number; limit: number };
  conversations7d: number;
  unanswered7d: number;
}

export interface AssistantConversationItem {
  id: string;
  lastAt: string;
  createdAt: string;
  count: number;
  lastMessage: { role: 'user' | 'assistant'; text: string; at: string } | null;
  hasUnanswered: boolean;
  signedIn: boolean;
  customerFirstName: string | null;
  productId: string | null;
  seen: boolean;
}

export interface AssistantConversation {
  id: string;
  brand: { id: string; name: string; slug: string };
  signedIn: boolean;
  customerFirstName: string | null;
  product: { id: string; title: string; imageUrl: string | null } | null;
  lastAt: string;
  createdAt: string;
  count: number;
  messages: {
    role: 'user' | 'assistant';
    text: string;
    at: string;
    unanswered?: boolean;
    products?: { id: string; title: string; imageUrl: string | null }[];
  }[];
}

/** The public reply (POST brands/:slug/assistant/messages). */
export interface PublicAssistantReply {
  conversationId: string;
  reply: {
    text: string;
    products?: { id: string; title: string; price: number; imageUrl: string | null }[];
    actions?: ('login' | 'orders' | 'whatsapp' | 'open_app')[];
    unanswered?: boolean;
  };
}
