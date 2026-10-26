"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  X,
} from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import {
  ButtonLoader,
  CreatePayoutAccountResponseType,
  FetchSellerDetailsResponseType,
  NotificationChannel,
} from "@packages/ui";
import { useSeller } from "@/hooks/use-seller";

type SectionKey = "low-stock" | "order-notifications";

const TABS = ["General", "Custom Domains", "Withdraw Method"] as const;
type Tab = (typeof TABS)[number];

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "web", label: "Web Push Notification" },
  { value: "app", label: "App Push Notification" },
  { value: "all", label: "All of the above" },
];

const RESTORE_WINDOW_DAYS = 28;
const CARD = "bg-slate-800 border border-slate-700/60 rounded-lg shadow-lg";

async function fetchSellerDetails(id: string) {
  const response = await axiosInstance.get<FetchSellerDetailsResponseType>(
    `/api/sellers/${id}`,
  );

  return response.data;
}

const getDaysLeft = (deletedAt: string | null | undefined) => {
  if (!deletedAt) return 0;
  const expires =
    new Date(deletedAt).getTime() + RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
};

const getErrorMessage = (err: unknown) => {
  const fallback = "Something went wrong. Please try again later.";
  return axios.isAxiosError(err)
    ? (err.response?.data?.message ?? fallback)
    : fallback;
};

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  isOpen?: boolean;
  danger?: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

const SettingRow = ({
  icon,
  title,
  description,
  isOpen = false,
  danger = false,
  onToggle,
  children,
}: SettingRowProps) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={children ? isOpen : undefined}
      className="flex w-full items-center justify-between gap-4 py-4 text-left"
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${danger ? "text-red-400" : "text-blue-400"}`}>
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p
            className={`mt-0.5 text-xs ${
              danger ? "text-red-400/80" : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-400 transition-colors hover:border-slate-400 hover:text-white">
        {children ? (
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        ) : (
          <ChevronRight size={14} />
        )}
      </span>
    </button>

    {children && isOpen && <div className="pb-5 pl-8">{children}</div>}
  </div>
);

const SaveButton = ({
  isSaving,
  onClick,
}: {
  isSaving: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isSaving}
    className="mt-3 flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isSaving ? <ButtonLoader size={16} /> : <Save size={16} />}
    {isSaving ? "Saving..." : "Save Changes"}
  </button>
);

/* ------------------------------ Delete modal ------------------------------ */

type DeleteShopModalProps = {
  isScheduledForDeletion: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onRestore: () => void;
};

const DeleteShopModal = ({
  isScheduledForDeletion,
  isPending,
  onClose,
  onConfirmDelete,
  onRestore,
}: DeleteShopModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isPending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete Shop"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <Trash2 size={18} className="text-red-400" />
            Delete Shop
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="text-slate-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-300">
          Deleting your shop is a <strong>permanent action</strong>. However,
          you have <strong>{RESTORE_WINDOW_DAYS} days</strong> to restore your
          shop before it is permanently removed.
        </p>

        <p className="mt-3 flex items-start gap-2 text-sm text-slate-300">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-yellow-400"
          />
          <span>
            <strong>Important:</strong> Once the shop is permanently deleted,
            you <strong>cannot</strong> create a new account with the same email
            in the future.
          </span>
        </p>

        <div className="mt-4 rounded-md border border-slate-600 bg-slate-900/60 p-3 text-xs text-slate-300">
          You can <strong>restore</strong> your shop within{" "}
          {RESTORE_WINDOW_DAYS} days from the date of deletion. After that, it
          will be <strong>permanently removed</strong>.
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>

          {isScheduledForDeletion ? (
            <button
              type="button"
              onClick={onRestore}
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <ButtonLoader size={16} />}
              {isPending ? "Restoring..." : "Restore"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <ButtonLoader size={16} />}
              {isPending ? "Deleting..." : "Confirm Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const queryClient = useQueryClient();

  const { seller } = useSeller();

  const sellerId: string | undefined = undefined;

  const queryKey = ["shop-details", sellerId];

  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [threshold, setThreshold] = useState("10");
  const [channel, setChannel] = useState<NotificationChannel>("email");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [payoutJustConnected, setPayoutJustConnected] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchSellerDetails(seller?.shop?.id),
    enabled: !!seller?.id,
    staleTime: 1000 * 60 * 5,
  });

  const shop = data?.shop;

  useEffect(() => {
    if (shop?.lowStockThreshold !== undefined) {
      setThreshold(String(shop.lowStockThreshold));
    }
    if (shop?.orderNotificationChannel) {
      setChannel(shop.orderNotificationChannel);
    }
  }, [shop?.lowStockThreshold, shop?.orderNotificationChannel]);

  const toggleSection = (key: SectionKey) =>
    setOpenSection((current) => (current === key ? null : key));

  /* ------------------------------- Mutations ------------------------------ */

  const lowStockMutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await axiosInstance.put(`/api/sellers/shops/low-stock`, {
        threshold: value,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-details"] });

      toast.success("Low stock alert threshold updated.");
      setOpenSection(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const notificationMutation = useMutation({
    mutationFn: async (value: NotificationChannel) => {
      const res = await axiosInstance.put(
        `/api/sellers/shops/order-notifications`,
        {
          channel: value,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-details"] });

      toast.success("Order notification preference updated.");
      setOpenSection(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(`/api/sellers/shops`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-details"] });
      toast.success(
        `Shop scheduled for deletion. You can restore it within ${RESTORE_WINDOW_DAYS} days.`,
      );
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.put(`/api/sellers/shops/restore`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Shop restored.");
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const payoutMutation = useMutation({
    mutationFn: async (values: { bankName: string; accountNumber: string }) => {
      const res = await axiosInstance.post<CreatePayoutAccountResponseType>(
        `/api/sellers/shops/payout-account`,
        values,
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Payout account connected.");
      setPayoutJustConnected(true);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSaveThreshold = () => {
    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 0) {
      toast.error("Enter a whole number of 0 or more.");
      return;
    }
    lowStockMutation.mutate(value);
  };

  const handleConnectPayout = () => {
    if (!bankName.trim()) {
      toast.error("Enter your bank name.");
      return;
    }
    if (!/^\d{6,20}$/.test(accountNumber.trim())) {
      toast.error("Enter a valid account number (6-20 digits).");
      return;
    }
    payoutMutation.mutate({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
    });
  };

  const payoutConnected =
    payoutJustConnected || !!seller?.paystackSubaccountCode;
  const isScheduledForDeletion = !!shop?.isDeleted;
  const daysLeft = getDaysLeft(shop?.deletedAt);

  return (
    <div className="w-full min-h-screen bg-slate-900 p-4 sm:p-8 font-Poppins">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <nav
        aria-label="Breadcrumb"
        className="mt-1 flex items-center gap-1 text-sm"
      >
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-500" />
        <span className="text-slate-300">Settings</span>
      </nav>

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto border-b border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 whitespace-nowrap -mb-px border-b-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === "General" && (
        <div className={`${CARD} mt-6 max-w-2xl px-5`}>
          {isError ? (
            <div className="py-6 text-sm text-slate-300">
              Couldn&apos;t load your shop settings.{" "}
              <button
                type="button"
                onClick={() => refetch()}
                className="text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : isPending ? (
            <div className="space-y-4 py-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-md bg-slate-700/50"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-700/60">
                <SettingRow
                  icon={<Bell size={18} />}
                  title="Low Stock Alert Threshold"
                  description="Get notified when stock falls below the set limit."
                  isOpen={openSection === "low-stock"}
                  onToggle={() => toggleSection("low-stock")}
                >
                  <label
                    htmlFor="threshold"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Threshold Value
                  </label>
                  <input
                    id="threshold"
                    type="number"
                    min={0}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500"
                  />
                  <SaveButton
                    isSaving={lowStockMutation.isPending}
                    onClick={handleSaveThreshold}
                  />
                </SettingRow>

                <SettingRow
                  icon={<BellRing size={18} />}
                  title="Order Notification Preferences"
                  description="Choose how you receive order notifications (Email, Web, App)."
                  isOpen={openSection === "order-notifications"}
                  onToggle={() => toggleSection("order-notifications")}
                >
                  <select
                    aria-label="Order notification channel"
                    value={channel}
                    onChange={(e) =>
                      setChannel(e.target.value as NotificationChannel)
                    }
                    className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500"
                  >
                    {CHANNEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <SaveButton
                    isSaving={notificationMutation.isPending}
                    onClick={() => notificationMutation.mutate(channel)}
                  />
                </SettingRow>
              </div>

              <div className="mt-2 border-t border-slate-700/60 pt-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-red-500">
                  <AlertTriangle size={16} />
                  Danger Zone
                </h2>

                <SettingRow
                  icon={<Trash2 size={18} />}
                  title="Delete Shop"
                  danger
                  description={
                    isScheduledForDeletion
                      ? `Scheduled for deletion. ${daysLeft} day${
                          daysLeft === 1 ? "" : "s"
                        } left to restore.`
                      : "Deleting your shop is irreversible. Proceed with caution."
                  }
                  onToggle={() => setShowDeleteModal(true)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "Custom Domains" && (
        <div className={`${CARD} mt-6 max-w-2xl p-4 text-sm text-slate-400`}>
          Custom domain settings coming soon.
        </div>
      )}

      {activeTab === "Withdraw Method" && (
        <div className={`${CARD} mt-6 max-w-2xl px-5`}>
          {payoutConnected ? (
            <div className="flex items-center gap-2 py-6 text-sm text-green-400">
              <CheckCircle2 size={18} />
              Your Paystack payout account is connected. Your share of sales
              settles directly into your bank account.
            </div>
          ) : (
            <>
              <p className="pt-5 text-sm text-slate-300">
                Connect your bank account to receive your share of sales. Your
                details are sent to Paystack to create a payout subaccount.
              </p>
              <div className="space-y-4 py-5">
                <div>
                  <label
                    htmlFor="bank-name"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Bank name
                  </label>
                  <input
                    id="bank-name"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. GCB Bank"
                    className="mt-1.5 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="account-number"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Account number
                  </label>
                  <input
                    id="account-number"
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="mt-1.5 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pb-5">
                <button
                  type="button"
                  onClick={handleConnectPayout}
                  disabled={payoutMutation.isPending}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {payoutMutation.isPending ? (
                    <ButtonLoader size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {payoutMutation.isPending
                    ? "Connecting..."
                    : "Connect Payout Account"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete / Restore modal */}
      {showDeleteModal && (
        <DeleteShopModal
          isScheduledForDeletion={isScheduledForDeletion}
          isPending={deleteMutation.isPending || restoreMutation.isPending}
          onClose={() => setShowDeleteModal(false)}
          onConfirmDelete={() => deleteMutation.mutate()}
          onRestore={() => restoreMutation.mutate()}
        />
      )}
    </div>
  );
};

export default SettingsPage;
