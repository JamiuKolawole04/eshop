"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import QueryProvider from "./query-provider";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-center" />
    </QueryProvider>
  );
};

export default Providers;
