export type PageViewDay = {
  date: string;
  views: number;
  visitors: number;
};

export type AdminPageViewsResponseType = {
  success: boolean;
  page: string;
  days: PageViewDay[];
  lastVisit: string | null;
};
