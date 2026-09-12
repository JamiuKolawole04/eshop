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
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }
  return (
    <Fragment>
      {user && (
        <WebSocketProvider user={user ?? null}>{children}</WebSocketProvider>
      )}
    </Fragment>
  );
};

export default Providers;
