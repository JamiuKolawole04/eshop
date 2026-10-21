export type SellerGeoStatsResponseType = {
  success: boolean;
  data: Array<{
    name: string;
    users: number;
  }>;
};

export type AdminGeoStatsResponseType = SellerGeoStatsResponseType;
