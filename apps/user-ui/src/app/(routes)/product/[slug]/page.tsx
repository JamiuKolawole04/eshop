import { Metadata } from "next";

import axiosInstance from "@/utils/axiosInstance";
import { GetProductBySlugResponseType } from "@packages/ui";
import { ProductDetails } from "@/shared/components/product/productDetails";

type Params = { params: Promise<{ slug: string }> };

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get<GetProductBySlugResponseType>(
    `/api/products/${slug}`,
  );

  return response.data?.product;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  return {
    title: `${product?.title} | "Eshop Marketplace`,
    description:
      product?.short_description ||
      "Discover high-quality products on Eshop Marketplace.",
    openGraph: {
      title: product?.title,
      description: product?.short_description || "",
      images: [
        product?.images?.[0]?.url ||
          "https://ik.imagekit.io/jnven3dnh3/eshop-products/E-Shop%20Quality%20Products%20Banner.png",
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.short_description || "",
      images: [
        product?.images?.[0]?.url ||
          "https://ik.imagekit.io/jnven3dnh3/eshop-products/E-Shop%20Quality%20Products%20Banner.png",
      ],
    },
  };
}

const Page = async ({ params }: Params) => {
  const { slug } = await params;
  const productDetails = await fetchProductDetails(slug);

  return <ProductDetails product={productDetails} />;
};

export default Page;
