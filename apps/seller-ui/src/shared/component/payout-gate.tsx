"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { useSeller } from "@/hooks/use-seller";

type Props = {
  children: React.ReactNode;
};

export const PayoutGate = ({ children }: Props) => {
  const { seller, isLoading } = useSeller();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10 font-Poppins sm:px-6 lg:px-8"
      >
        <div className="w-full max-w-lg rounded-xl border border-slate-700/60 bg-slate-800/60 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-700/60" />

            <div className="flex-1 space-y-2.5">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-700/60" />
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-700/40" />
            </div>
          </div>

          <span className="sr-only">Checking your payout account</span>
        </div>
      </div>
    );
  }

  if (seller?.paystackSubaccountCode) {
    return <>{children}</>;
  }

  return (
    <div className="relative isolate flex min-h-[80vh] w-full items-center justify-center px-4 py-10 font-Poppins sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_65%)]"
      />

      <div className="w-full max-w-lg rounded-xl border border-slate-700/60 bg-slate-800/90 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-inset ring-amber-500/30">
          <Lock size={24} className="text-amber-400" aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-balance text-xl font-semibold text-white sm:text-2xl">
          Connect your bank account to add products
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
          Your products can&apos;t be listed or paid for until you&apos;ve
          connected a payout account. This is how you get paid when a customer
          buys from you.
        </p>

        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <Link
            href="/dashboard/settings?tab=withdraw"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          >
            Connect bank account
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
