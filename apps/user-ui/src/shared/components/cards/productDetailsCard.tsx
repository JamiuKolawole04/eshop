import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ShoppingCartIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProductWithRelationsType } from "@packages/ui";
import Ratings from "../ratings";

type Props = {
  data: ProductWithRelationsType;
  setIsOpen: (open: boolean) => void;
};

export const ProductDetailsCard = ({ data, setIsOpen }: Props) => {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(0);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-[110] pb-10"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <Image
              src={data?.images[activeImage]?.url}
              alt={data?.images[activeImage]?.url}
              width={400}
              height={400}
              className="w-full rounded-lg object-contain"
            />

            <div className="flex gap-2 mt-4">
              {data?.images?.map((img, index) => (
                <div
                  key={index + 1}
                  className={`cursor-pointer border rounded-md ${activeImage === index ? "border-gray-500 p-1" : "border-transparent"}`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${index}`}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Image
                  src={data?.shop?.avatar}
                  alt="shop-logo"
                  width={60}
                  height={60}
                  className="rounded-full w-[60px] h-[60px] object-cover"
                />

                <div>
                  <Link
                    href={`/shop/${data?.shop?.id}`}
                    className="text-lg font-medium"
                  >
                    {data?.shop.name}
                  </Link>

                  <span className="block mt-1">
                    <Ratings rating={data?.shop.ratings} />
                  </span>

                  <p className="text-gray-600 mt-1 flex items-center text-xs">
                    <MapPin size={16} className="mr-0.5" />
                    {data?.shop?.address || "Location Not Available"}
                  </p>
                </div>
              </div>

              <button
                className="text-xs inline-flex w-fit cursor-pointer items-center gap-2 px-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium hover:scale-105 transition"
                onClick={() => router.push(`/inbox?shopId=${data?.shop?.id}`)}
              >
                💬 Chat with Seller
              </button>

              <button className="w-full absolute cursor-pointer right-[-5px] top-[-5px] flex justify-end my-2 mt-[-10px]">
                <X size={22} onClick={() => setIsOpen(false)} />
              </button>
            </div>

            <h3 className="text-xl font-semibold mt-3">{data?.title}</h3>

            <p className="mt-2 text-gray-300 whitespace-pre-wrap w-full">
              {data?.short_description}
            </p>

            {data?.brand && (
              <p className="mt-2 text-sm">
                <strong className="mr-0.5">Band:</strong>
                {data?.brand}
              </p>
            )}

            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {data?.colors?.length > 0 && (
                <div>
                  <strong>Color:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.colors.map((color, index) => (
                      <button
                        key={index + 1}
                        className={`w-7 h-7 cursor-pointer rounded-full border-2 transition ${isSelected === color ? "border-gray-400 scale-110 shadow-md" : "border-transparent"}`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {data?.sizes?.length > 0 && (
                <div>
                  <strong>Size:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.sizes.map((size, index) => (
                      <button
                        key={index + 1}
                        className={`px-4 py-1 cursor-pointer rounded-md transition ${isSizeSelected === size ? "bg-gray-800 text-white" : "bg-gray-300 text-black"}`}
                        onClick={() => setIsSizeSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                ${data?.sale_price}
              </h3>

              {data?.regular_price && (
                <h3 className="text-lg text-red-600 line-through">
                  ${data.regular_price}
                </h3>
              )}
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>

                <span className="px-4 bg-gray-100 py-1">{quantity}</span>

                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>

              <button
                className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition`}
              >
                <ShoppingCartIcon size={18} />
                Add to cart
              </button>

              <button className={`opacity-[.7] cursor-pointer`}>
                <Heart size={30} fill="red" color="red" />
              </button>
            </div>

            <div className="mt-3">
              {data?.stock > 0 ? (
                <span className="text-green-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery :
              <strong className="ml-1">
                {estimatedDelivery.toDateString()}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
