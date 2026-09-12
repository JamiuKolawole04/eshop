"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext<{
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
} | null>(null);

export const WebSocketProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { id: string };
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const ws = new WebSocket(
      String(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URL),
    );

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(`user_${user.id}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(String(event.data));

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      }
    };

    return () => {
      ws.close();
    };
  }, [user?.id]);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
