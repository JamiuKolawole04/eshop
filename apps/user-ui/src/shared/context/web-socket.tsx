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
  const [_, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const userIdRef = useRef(user?.id);

  userIdRef.current = user?.id;

  useEffect(() => {
    if (!userIdRef.current) {
      return;
    }

    const ws = new WebSocket(
      String(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URL),
    );

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(`user_${userIdRef.current}`);
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(String(event.data));

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      setWsReady(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (userIdRef.current && wsRef.current?.readyState === WebSocket.CLOSED) {
      // Create new WebSocket with updated user ID
      const ws = new WebSocket(
        String(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URL),
      );
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(`user_${userIdRef.current}`);
        setWsReady(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(String(event.data));

        if (data.type === "UNSEEN_COUNT_UPDATE") {
          const { conversationId, count } = data.payload;
          setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        setWsReady(false);
      };
    }
  }, [userIdRef.current]);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
