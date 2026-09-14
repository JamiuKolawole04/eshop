"use client";

import { Fragment, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import QueryProvider from "./query-provider";
import { useSeller } from "@/hooks/use-seller";
import { WebSocketProvider } from "./web-socket";

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
  const { seller } = useSeller();

  return (
    <Fragment>
      <WebSocketProvider seller={seller ?? null}>{children}</WebSocketProvider>
    </Fragment>
  );
};

export default Providers;
