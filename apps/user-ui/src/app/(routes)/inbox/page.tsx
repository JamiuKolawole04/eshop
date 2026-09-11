"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useUser } from "@/hooks/use-user";
import axiosInstance from "@/utils/axiosInstance";
import {
  GetUserConversationResponseType,
  UserConversation,
} from "@packages/ui";

const fetchConversations = async () => {
  const response = await axiosInstance.get<GetUserConversationResponseType>(
    `/api/chatting/conversations/user`,
  );

  return response.data.conversations;
};

const Inbox = () => {
  const query = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();

  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<UserConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserConversation | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get("conversationId");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  useEffect(() => {
    if (conversations) {
      setChats(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (!isLoading && conversationId && chats.length > 0) {
      const chat = chats.find(
        (conversation) => conversation.conversationId === conversationId,
      );

      setSelectedChat(chat ?? null);
    }
  }, [conversationId, chats]);

  const getLastMessage = (chat: UserConversation) => chat?.lastMessage || "";

  return (
    <div className="w-full font-Poppins">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div className="w-[320px] border-r border-r-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>

            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No conversation</div>
              ) : (
                chats?.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat?.conversationId}
                      className={`w-full text-left px-4 py-3 transition hover:bg-blue-50 ${isActive ? "bg-blue-100" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={String(chat?.seller?.avatar)}
                          alt={chat?.seller?.name}
                          width={36}
                          height={36}
                          className="rounded-full border w-[40px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {chat?.seller?.name}
                            </span>

                            {chat?.seller?.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>

                          <p className="text-xs text-gray-500 truncate max-w-[170px]">
                            {getLastMessage(chat)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
