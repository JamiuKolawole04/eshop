"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { useSeller } from "@/hooks/use-seller";

export const PayoutBanner = () => {
  const { seller, isLoading } = useSeller();

  if (isLoading || !seller || seller.paystackSubaccountCode) {
    return null;
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 font-Poppins sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-amber-400"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-medium text-amber-200">
            Connect your bank account to receive payouts
          </p>
          <p className="mt-0.5 text-xs text-amber-200/70 sm:text-sm">
            You can&apos;t list products until your payout account is
            connected.
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/settings?tab=withdraw"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-amber-500 px-3.5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        Connect bank account
      </Link>
    </div>
  );
};
