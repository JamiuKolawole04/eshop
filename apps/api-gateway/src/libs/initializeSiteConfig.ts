import { PrismaClient } from "@packages/prisma";

const prisma = new PrismaClient();
export const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
          ],
          subCategories: {
            Electronics: ["Mobiles", "Laptops", "Accessories", "Gaming"],
            Fashion: ["Men", "Women", "Kids", "Footwear"],
            "Home & Kitchen": ["Furniture", "Appliances", "Decor"],
            "Sports & Fitness": [
              "Gym Equipment",
              "Outdoor Sports",
              "Wearables",
            ],
          },
          logo: "https://ik.imagekit.io/jnven3dnh3/eshop-products/E-shop-logo.png",
          banner: "https://ik.imagekit.io/jnven3dnh3/eshop-products/watch.png",
        },
      });
      console.info("Site config initialized");
    } else {
      console.info("Site config already exists");
    }
  } catch (error) {
    console.error("Error initializing site config:", error);
  }
};
