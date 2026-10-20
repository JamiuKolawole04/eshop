export type SellerGeoStatsResponseType = {
  success: boolean;
  data: Array<{
    name: string;
    users: number;
  }>;
};
