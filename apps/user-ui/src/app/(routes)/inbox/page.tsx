"use client";

import {
  Fragment,
  InputEvent,
  SubmitEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useUser } from "@/hooks/use-user";
import axiosInstance from "@/utils/axiosInstance";
import {
  GetUserConversationResponseType,
  GetUserMessagesResponseType,
  UserConversation,
} from "@packages/ui";
import { ChatInput } from "@/shared/components/chats/chat-input";

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

  const fetchMessages = async ({ pageParam = 1 }) => {
    const res = await axiosInstance.get<GetUserMessagesResponseType>(
      `/api/chatting/conversations/${conversationId}/messages`,
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

  const handleSelectChat = (chat: UserConversation) => {
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat?.conversationId
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );

    router.push(`?conversationId=${chat.conversationId}`);
  };

  const handleSendMessage = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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

          <div className="flex flex-col flex-1 bg-gray-100">
            {selectedChat ? (
              <Fragment>
                <div className="p-4 border-b-gray-200 bg-white flex items-center gap-3">
                  <Image
                    src={String(selectedChat?.seller?.avatar)}
                    alt={selectedChat?.seller?.name}
                    width={40}
                    height={40}
                    className="rounded-full border w-[40px] h-[40px] object-cover border-gray-200"
                  />

                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat?.seller?.name}
                    </h2>

                    <p className="text-xs text-gray-500">
                      {selectedChat?.seller?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm"
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

                  {messages?.map((message) => (
                    <div
                      className={`flex flex-col ${message?.senderType === "user" ? "items-end ml-auto" : "items-start"} max-w-[80%]`}
                      key={message.id}
                    >
                      <div
                        className={`${
                          message.senderType === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800"
                        } px-4 py-2 rounded-lg shadow-sm w-fit`}
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
