import axios from "axios";

import { ValidationError } from "@packages/error-handler";
import {
  PaystackEnvelope,
  PaystackInitializeInput,
  PaystackInitializeResult,
  PaystackSubaccountInput,
  PaystackSubaccountResult,
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

  private async post<T>(path: string, payload: unknown): Promise<T> {
    const secretKey = this.getSecretKey();

    let body: PaystackEnvelope<T>;
    try {
      const response = await axios.post(
        `${PAYSTACK_API_BASE_URL}${path}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      body = response.data as PaystackEnvelope<T>;
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

  async connectSubAccount(
    input: PaystackSubaccountInput,
  ): Promise<PaystackSubaccountResult> {
    const payload = {
      business_name: input.businessName,
      settlement_bank: input.settlementBank,
      account_number: input.accountNumber,
      percentage_charge: 10,
    };

    const data = await this.post<{ subaccount_code: string }>(
      "/subaccount",
      payload,
    );

    if (!data.subaccount_code) {
      throw new ValidationError("Payout setup failed. Please try again later.");
    }

    return { subaccountCode: data.subaccount_code };
  }

  async initialize(
    input: PaystackInitializeInput,
  ): Promise<PaystackInitializeResult> {
    const data = await this.post<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>("/transaction/initialize", {
      email: input.email,
      amount: input.amountInSubunits,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      ...(input.split ? { split: input.split } : {}),
    });

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
}

export const paystack = new PaystackClient();
