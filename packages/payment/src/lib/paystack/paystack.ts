import axios from "axios";

import { ValidationError } from "@packages/error-handler";
import {
  PaystackConnectSubaccountResponse,
  PaystackEnvelope,
  PaystackInitializeInput,
  PaystackInitializeTransactionResponse,
  PaystackListBanksResponse,
  PaystackResolveAccountInput,
  PaystackResolveAccountResponse,
  PaystackSubaccountInput,
  PaystackSubaccountUpdateResponse,
} from "../types/paystack.type.js";

const PAYSTACK_API_BASE_URL = "https://api.paystack.co";

export class PaystackClient {
  private getSecretKey(): string {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new ValidationError(
        "Payment processor is not configured. Please contact support.",
      );
    }
    return secretKey;
  }

  private toValidationError(
    err: unknown,
    fallbackMessage: string,
  ): ValidationError {
    let providerMessage: string | undefined;
    if (axios.isAxiosError(err)) {
      providerMessage = (err.response?.data as { message?: string } | undefined)
        ?.message;
    }
    return new ValidationError(providerMessage ?? fallbackMessage);
  }

  private async request<T>(
    method: "POST" | "PUT" | "GET",
    path: string,
    payload?: unknown,
  ): Promise<T> {
    const secretKey = this.getSecretKey();

    let body: PaystackEnvelope<T>;
    try {
      const response = await axios.request<PaystackEnvelope<T>>({
        method,
        url: `${PAYSTACK_API_BASE_URL}${path}`,
        data: payload,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      });
      body = response.data;
    } catch (err) {
      throw this.toValidationError(
        err,
        "Payment request failed. Please try again later.",
      );
    }

    if (!body?.status || !body?.data) {
      throw new ValidationError(
        body?.message ?? "Payment request failed. Please try again later.",
      );
    }

    return body.data;
  }

  private post<T>(path: string, payload: unknown): Promise<T> {
    return this.request<T>("POST", path, payload);
  }

  private put<T>(path: string, payload: unknown): Promise<T> {
    return this.request<T>("PUT", path, payload);
  }

  private get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async connectSubAccount(input: PaystackSubaccountInput) {
    const payload = {
      business_name: input.businessName,
      settlement_bank: input.settlementBank,
      account_number: input.accountNumber,
      percentage_charge: 10,
    };

    const data = await this.post<PaystackConnectSubaccountResponse>(
      "/subaccount",
      payload,
    );

    if (!data.subaccount_code) {
      throw new ValidationError("Payout setup failed. Please try again later.");
    }

    return { subaccountCode: data.subaccount_code };
  }

  async deactivateSubAccount(subaccountCode: string): Promise<void> {
    const code = subaccountCode.trim();

    if (!code) {
      throw new ValidationError("Payout account code is required");
    }

    await this.put<PaystackSubaccountUpdateResponse>(
      `/subaccount/${encodeURIComponent(code)}`,
      { active: false },
    );
  }

  async initialize(input: PaystackInitializeInput) {
    const payload = {
      email: input.email,
      amount: input.amountInSubunits,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      ...(input.split ? { split: input.split } : {}),
    };

    const data = await this.post<PaystackInitializeTransactionResponse>(
      "/transaction/initialize",
      payload,
    );

    if (!data.authorization_url) {
      throw new ValidationError(
        "Could not start payment. Please try again later.",
      );
    }

    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    };
  }

  async listBanks(): Promise<PaystackListBanksResponse> {
    return this.get<PaystackListBanksResponse>("/bank?country=nigeria");
  }

  async resolveAccount(input: PaystackResolveAccountInput) {
    const query = new URLSearchParams({
      account_number: input.accountNumber,
      bank_code: input.bankCode,
    });

    const data = await this.get<PaystackResolveAccountResponse>(
      `/bank/resolve?${query.toString()}`,
    );

    if (!data.account_name) {
      throw new ValidationError(
        "Could not verify this account. Please check the details and try again.",
      );
    }

    return {
      accountName: data.account_name,
      accountNumber: data.account_number,
    };
  }
}

export const paystack = new PaystackClient();
