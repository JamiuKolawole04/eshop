"use client";

import { useRef, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const Inbox = () => {
  const query = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();

  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get("conversationId");

  return (
    <div className="w-full">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div className="w-[320px] border-r border-r-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
