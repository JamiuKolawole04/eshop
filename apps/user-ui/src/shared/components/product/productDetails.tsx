import { ProductWithRelationsType } from "@packages/ui";

type Props = {
  product: ProductWithRelationsType;
};

export const ProductDetails = ({ product }: Props) => {
  return <div className="w-full bg-[#f5f5f5] py-5"></div>;
};
