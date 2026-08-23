export type Actions = {
  shopId: string;
  action: string;
  productId: string;
  timestamp?: Date;
};

export type EventData = Actions & {
  userId: string;
  country?: string;
  city?: string;
  device?: string;
};
