export type WebsiteCustomizationResponse = {
  categories: string[];
  subCategories: Record<string, string[]>;
  logo: string | null;
  banner: string | null;
};
