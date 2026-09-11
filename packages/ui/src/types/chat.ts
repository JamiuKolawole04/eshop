import { FileType } from "./file";

type Conversation = {
  name: string | null;
  id: string;
  isGroup: boolean;
  creatorId: string;
  participantIds: string[];

  createdAt: string;
  updatedAt: string;
};

export type CreateConversationResponseType = {
  success: boolean;
  conversation: Conversation;
  isNew: boolean;
};

export type UserConversation = {
  conversationId: string;
  seller: {
    id: string | null;
    name: string;
    isOnline: boolean;
    avatar: string | undefined;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type GetUserConversationResponseType = {
  success: true;
  conversations: UserConversation[];
};

export type SellerConversation = {
  conversationId: string;
  user: {
    id: string | null;
    name: string;
    avatar: FileType | null;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type GetSellerConversationResponseType = {
  success: true;
  conversations: SellerConversation[];
};
