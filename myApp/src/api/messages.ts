import { api } from './client';
import { User } from './auth';

// Types
export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video';
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface MessagesResponse {
  messages: Message[];
  user: {
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

interface SendMessageResponse {
  message: string;
  data: Message;
}

// Messages API functions
export const messagesAPI = {
  // Get all conversations
  getConversations: async () => {
    return await api.get<ConversationsResponse>('/messages/conversations');
  },

  // Get messages with a specific user
  getMessages: async (userId: string, limit = 50, before?: string) => {
    let url = `/messages/${userId}?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    return await api.get<MessagesResponse>(url);
  },

  // Send a message
  sendMessage: async (userId: string, content: string, messageType = 'text') => {
    return await api.post<SendMessageResponse>(`/messages/${userId}`, {
      content,
      messageType,
    });
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    return await api.put<{ message: string }>(`/messages/${messageId}/read`, {});
  },
};

