export type SellerDeviceUsageResponseType = {
  success: boolean;
  deviceUsage: Array<{
    name: string;
    value: number;
  }>;
};
