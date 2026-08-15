export type DiscountType = "percentage" | "fixed";

export type DiscountCode = {
  id: string;
  public_name: string;
  discountType: DiscountType;
  discountValue: number;
  discountCode: string;
  sellerId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type CreateDiscountCodeResponseType = {
  success: boolean;
  discount_code: DiscountCode;
};

export type AllDiscountCodeResponseType = {
  success: boolean;
  discount_codes: Array<DiscountCode>;
};

export type DeleteDiscountCodeResponseType = {
  message: string;
};
