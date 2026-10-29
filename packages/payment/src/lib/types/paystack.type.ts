export type PaystackSubaccountInput = {
  businessName: string;
  settlementBank: string;
  accountNumber: string;
};

export type PaystackSubaccountResult = {
  subaccountCode: string;
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

export type PaystackInitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackConnectSubAccount = {
  status: boolean;
  message: "Subaccount created";
  data: {
    business_name: string;
    account_number: string;
    percentage_charge: number;
    settlement_bank: string;
    currency: "GMD" | "NGN" | "USD";
    bank: number;
    integration: number;
    domain: "test" | "live";
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
};
