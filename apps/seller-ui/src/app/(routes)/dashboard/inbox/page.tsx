/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Fragment, SubmitEvent, useEffect, useRef, useState } from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useSeller } from "@/hooks/use-seller";
import axiosInstance from "@/utils/axiosInstance";
import {
  GetSellerConversationResponseType,
  GetSellerMessagesResponseType,
  SellerConversation,
} from "@packages/ui";
import { useWebSocket } from "@/shared/context/web-socket";
import { ChatInput } from "@/shared/component/chats/chat-input";

type MessagesInfiniteData = InfiniteData<GetSellerMessagesResponseType>;

const fetchConversations = async () => {
  const response = await axiosInstance.get<GetSellerConversationResponseType>(
    `/api/chatting/conversations/seller`,
  );

  return response.data.conversations;
};

const Inbox = () => {
  const query = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { seller, isLoading: isUserLoading } = useSeller();
  const { ws, unreadCounts } = useWebSocket();

  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<SellerConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<SellerConversation | null>(
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

  const getLastMessage = (chat: SellerConversation) => chat?.lastMessage || "";

  const fetchMessages = async ({ pageParam = 1 }) => {
    const res = await axiosInstance.get<GetSellerMessagesResponseType>(
      `/api/chatting/conversations/${conversationId}/messages/seller`,
      {
        // ...isProtected,
        params: { page: pageParam },
      },
    );
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["messages", conversationId],
      queryFn: fetchMessages,
      enabled: !!conversationId,
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    });

  const messages = data?.pages.flatMap((page) => page.messages).reverse() ?? [];

  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (lastMessageId) handleScrollToBottom();
  }, [lastMessageId]);

  const handleSelectChat = (chat: SellerConversation) => {
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat?.conversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );

    router.push(`?conversationId=${chat.conversationId}`);
    ws?.send(
      JSON.stringify({
        type: "MARK_AS_SEEN",
        conversationId: chat.conversationId,
      }),
    );
  };

  const handleScrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollAnchorRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    });
  };

  const handleSendMessage = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat) {
      return;
    }

    const payload = {
      fromUserId: seller?.id,
      toUserId: selectedChat?.user?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "seller",
    };

    ws?.send(JSON.stringify(payload));

    // optimistic update — append the new message to the first (most recent) page
    query.setQueryData<MessagesInfiniteData>(
      ["messages", selectedChat.conversationId],
      (old: any) => {
        if (!old) return old;

        const newMessage = {
          content: payload.messageBody,
          senderType: "seller",
          seen: false,
          createdAt: new Date().toISOString(),
        };

        const [firstPage, ...restPages] = old.pages;

        return {
          ...old,
          pages: [
            { ...firstPage, messages: [newMessage, ...firstPage.messages] },
            ...restPages,
          ],
        };
      },
    );

    // updating sidebar's last-message preview
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === selectedChat.conversationId
          ? { ...c, lastMessage: payload.messageBody }
          : c,
      ),
    );

    setMessage("");
    handleScrollToBottom();
  };

  return (
    <div className="w-full h-full font-Poppins">
      <div className="flex h-full overflow-hidden">
        <div className="w-[320px] border-r border-r-gray-800 bg-[#0a0a0a]">
          <div className="p-4 border-b border-b-gray-800 text-lg font-semibold text-white">
            Messages
          </div>

          <div className="divide-y divide-gray-800">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-400">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No conversation</div>
            ) : (
              chats?.map((chat) => {
                const isActive =
                  selectedChat?.conversationId === chat.conversationId;

                return (
                  <button
                    onClick={() => handleSelectChat(chat)}
                    key={chat?.conversationId}
                    className={`w-full text-left px-4 py-3 transition hover:bg-gray-800 ${
                      isActive ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          // String(chat?.user?.avatar) ||
                          "https://ik.imagekit.io/jnven3dnh3/eshop-products/user-avatar.png"
                        }
                        alt={chat?.user?.name}
                        width={36}
                        height={36}
                        className="rounded-full border border-gray-700 w-[40px] object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-semibold">
                            {chat?.user?.name}
                          </span>

                          {chat?.user?.isOnline && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>

                        <p className="text-xs text-gray-400 truncate max-w-[170px]">
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

        <div className="flex flex-col flex-1 bg-[#0a0a0a]">
          {selectedChat ? (
            <Fragment>
              <div className="p-4 border-b border-b-gray-800 bg-[#0a0a0a] flex items-center gap-3">
                <Image
                  src={
                    // String(selectedChat?.user?.avatar) ||
                    "https://ik.imagekit.io/jnven3dnh3/eshop-products/user-avatar.png"
                  }
                  alt={selectedChat?.user?.name}
                  width={40}
                  height={40}
                  className="rounded-full border w-[40px] h-[40px] object-cover border-gray-700"
                />

                <div>
                  <h2 className="text-white font-semibold text-base">
                    {selectedChat?.user?.name}
                  </h2>

                  <p className="text-xs text-gray-400">
                    {selectedChat?.user?.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm bg-[#0a0a0a]"
              >
                {hasNextPage && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="text-xs px-4 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      {isFetchingNextPage
                        ? "Loading..."
                        : "Load previous message"}
                    </button>
                  </div>
                )}

                {messages?.map((message, index) => (
                  <div
                    className={`flex flex-col ${
                      message?.senderType === "seller"
                        ? "items-end ml-auto"
                        : "items-start"
                    } max-w-[80%]`}
                    key={index + 1}
                  >
                    <div
                      className={`${
                        message.senderType === "seller"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      } px-4 py-2 rounded-lg shadow-sm w-fit`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`text-[11px] text-gray-500 mt-1 flex items-center gap-1 ${
                        message.senderType === "user"
                          ? "mr-1 justify-end"
                          : "ml-1"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                <div ref={scrollAnchorRef} />
              </div>

              <ChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSendMessage}
              />
            </Fragment>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm bg-[#0a0a0a]">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
