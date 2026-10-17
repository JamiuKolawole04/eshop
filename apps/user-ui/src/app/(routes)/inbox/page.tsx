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
import { ArrowLeft } from "lucide-react";

import { useUser } from "@/hooks/use-user";
import axiosInstance from "@/utils/axiosInstance";
import {
  ButtonLoader,
  GetUserConversationResponseType,
  GetUserMessagesResponseType,
  UserConversation,
} from "@packages/ui";
import { ChatInput } from "@/shared/components/chats/chat-input";
import { useWebSocket } from "@/shared/context/web-socket";

type MessagesInfiniteData = InfiniteData<GetUserMessagesResponseType>;

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
  const { user } = useUser();
  const { ws } = useWebSocket();

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<UserConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserConversation | null>(
    null,
  );
  const [message, setMessage] = useState("");
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
    } else if (!conversationId) {
      // no ?conversationId= in the URL means no conversation is open (mobile back to list)
      setSelectedChat(null);
    }
  }, [conversationId, chats]);

  const getLastMessage = (chat: UserConversation) => chat?.lastMessage || "";

  const fetchMessages = async ({ pageParam = 1 }) => {
    const res = await axiosInstance.get<GetUserMessagesResponseType>(
      `/api/chatting/conversations/${conversationId}/messages`,
      {
        params: { page: pageParam },
      },
    );
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
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

  useEffect(() => {
    if (!ws) {
      return;
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        const newMessage = data?.payload;

        if (newMessage.conversationId === conversationId) {
          query.setQueryData<MessagesInfiniteData>(
            ["messages", conversationId],
            (old: any) => {
              if (!old) return old;

              const newMessagePayload = {
                content: newMessage.content,
                senderType: newMessage.senderType,
                seen: false,
                createdAt: newMessage.createdAt || new Date().toISOString(),
              };

              const [firstPage, ...restPages] = old.pages;

              return {
                ...old,
                pages: [
                  {
                    ...firstPage,
                    messages: [newMessagePayload, ...firstPage.messages],
                  },
                  ...restPages,
                ],
              };
            },
          );
          handleScrollToBottom();
        }
        // updating sidebar's last-message preview
        setChats((prev) =>
          prev.map((c) =>
            c.conversationId === newMessage.conversationId
              ? { ...c, lastMessage: newMessage.content }
              : c,
          ),
        );
      }

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setChats((prev) =>
          prev.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat,
          ),
        );
      }
    };
  }, [ws, query, conversationId]);

  const handleSelectChat = (chat: UserConversation) => {
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
      fromUserId: user?.id,
      toUserId: selectedChat?.seller?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "user",
    };

    ws?.send(JSON.stringify(payload));

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
    <div className="w-full font-Poppins">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div
            className={`w-full md:w-[320px] md:shrink-0 border-r border-r-gray-200 bg-gray-50 ${
              selectedChat ? "hidden md:block" : ""
            }`}
          >
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>

            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <ButtonLoader className="text-gray-500 text-center" />
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No conversation yet.
                </div>
              ) : (
                chats?.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      onClick={() => handleSelectChat(chat)}
                      key={chat?.conversationId}
                      className={`w-full text-left px-4 py-3 transition hover:bg-blue-50 ${isActive ? "bg-blue-100" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={String(chat?.seller?.avatar)}
                          alt={chat?.seller?.name}
                          width={36}
                          height={36}
                          className="shrink-0 rounded-full border w-[40px] object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold truncate">
                              {chat?.seller?.name}
                            </span>

                            {chat?.seller?.isOnline && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-400 truncate max-w-[170px]">
                              {getLastMessage(chat)}
                            </p>

                            {chat?.unreadCount > 0 && (
                              <span className="shrink-0 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] bg-blue-600 text-white">
                                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* min-w-0: without it this flex child can't shrink below its content
              width, so on mobile the pane grows wider than the screen and gets
              clipped (messages/input hugging the edge, send button cut off). */}
          <div
            className={`flex-col flex-1 min-w-0 bg-gray-100 ${
              selectedChat ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedChat ? (
              <Fragment>
                <div className="px-3 py-3 sm:px-4 sm:py-4 border-b-gray-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/inbox")}
                    aria-label="Back to messages"
                    className="shrink-0 md:hidden -ml-1 p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <Image
                    src={String(selectedChat?.seller?.avatar)}
                    alt={selectedChat?.seller?.name}
                    width={40}
                    height={40}
                    className="shrink-0 rounded-full border w-[40px] h-[40px] object-cover border-gray-200"
                  />

                  <div className="min-w-0">
                    <h2 className="text-gray-800 font-semibold text-base truncate">
                      {selectedChat?.seller?.name}
                    </h2>

                    <p className="text-xs text-gray-500">
                      {selectedChat?.seller?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 space-y-4 text-sm"
                >
                  {hasNextPage && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300"
                      >
                        {isFetchingNextPage
                          ? "Loading..."
                          : "Load previous message"}
                      </button>
                    </div>
                  )}

                  {messages?.map((message, index) => (
                    <div
                      className={`flex flex-col ${message?.senderType === "user" ? "items-end ml-auto" : "items-start"} max-w-[80%]`}
                      key={index + 1}
                    >
                      <div
                        className={`${
                          message.senderType === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800"
                        } px-4 py-2 rounded-lg shadow-sm w-fit max-w-full break-words [overflow-wrap:anywhere]`}
                      >
                        {message.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 mt-1 flex items-center gap-1 ${
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
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
