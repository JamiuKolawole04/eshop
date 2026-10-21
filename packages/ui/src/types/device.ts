export type SellerDeviceUsageResponseType = {
  success: boolean;
  deviceUsage: Array<{
    name: string;
    value: number;
  }>;
};

export type AdminDeviceUsageResponseType = {
  success: boolean;
  deviceUsage: Array<{
    name: string;
    value: number;
  }>;
};
