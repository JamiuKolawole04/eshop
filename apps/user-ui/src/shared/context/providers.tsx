"use client";

import { Fragment, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import QueryProvider from "./query-provider";
import { WebSocketProvider } from "./web-socket";
import { useUser } from "@/hooks/use-user";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  return (
    <QueryProvider>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
      <Toaster position="top-center" />
    </QueryProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();

  return user ? (
    <WebSocketProvider user={user}>{children}</WebSocketProvider>
  ) : (
    <Fragment>{children}</Fragment>
  );
};

export default Providers;
