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
