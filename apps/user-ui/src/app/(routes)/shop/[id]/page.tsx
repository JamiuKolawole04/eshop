import { Metadata } from "next";

import axiosInstance from "@/utils/axiosInstance";
import { FetchSellerDetailsResponseType } from "@packages/ui";
import SellerProfile from "@/shared/components/seller/sellerProfile";
import { SITE_NAME } from "@/shared/constants/site";

type Params = { params: Promise<{ id: string }> };

async function fetchSellerDetails(id: string) {
  const response = await axiosInstance.get<FetchSellerDetailsResponseType>(
    `/api/sellers/${id}`,
  );

  return response.data;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchSellerDetails(id);
  const shopTitle = data?.shop?.name;
  const brandedTitle = shopTitle ? `${shopTitle} | ${SITE_NAME}` : SITE_NAME;

  return {
    title: shopTitle,
    description:
      data?.shop?.bio ||
      "Explore products and services from trusted sellers on Eshop.",
    openGraph: {
      title: brandedTitle,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Eshop.",
      type: "website",
      images: [
        {
          url:
            data?.shop?.avatar ||
            "https://ik.imagekit.io/jnven3dnh3/eshop-products/shop-avater.png",
          width: 800,
          height: 600,
          alt: data?.shop?.name || "Shop Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Eshop.",
      images: [
        data?.shop?.avatar ||
          "https://ik.imagekit.io/jnven3dnh3/eshop-products/shop-avater.png?updatedAt=1786804398795",
      ],
    },
  };
}

const Page = async ({ params }: Params) => {
  const { id } = await params;
  const data = await fetchSellerDetails(id);
  return (
    <div className="font-Poppins">
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
};

export default Page;
