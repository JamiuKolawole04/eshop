export type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

type Domain = "test" | "live";

export type PaystackSubaccountInput = {
  businessName: string;
  settlementBank: string;
  accountNumber: string;
};

export type PaystackSubaccountUpdateResponse = {
  domain: Domain;
  subaccount_code: string;
  business_name: string;
  description: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  metadata: Record<string, unknown> | null;
  percentage_charge: number;
  is_verified: boolean;
  settlement_bank: string;
  account_number: string;
  settlement_schedule: string;
  active: boolean;
  migrate: boolean;
  currency: string;
  account_name: string;
  product: string;
  id: number;
  integration: number;
  bank: number;
  managed_by_integration: number;
  createdAt: string;
  updatedAt: string;
};

export type PaystackSplit = {
  type: "flat";
  bearer_type: "account" | "subaccount" | "all" | "all-pro-rata" | "grid";
  subaccounts: {
    subaccount: string;
    share: number;
  }[];
};

export type PaystackInitializeInput = {
  email: string;
  amountInSubunits: number;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  split?: PaystackSplit;
};

export type PaystackInitializeTransactionResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackConnectSubaccountResponse = {
  business_name: string;
  account_number: string;
  percentage_charge: number;
  settlement_bank: string;
  currency: string;
  bank: number;
  integration: number;
  domain: Domain;
  account_name: string;
  product: string;
  managed_by_integration: number;
  subaccount_code: string;
  is_verified: boolean;
  settlement_schedule: string;
  active: boolean;
  migrate: boolean;
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type PaystackBank = {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaystackListBanksResponse = PaystackBank[];

export type PaystackResolveAccountResponse = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export type PaystackResolveAccountInput = {
  accountNumber: string;
  bankCode: string;
};
