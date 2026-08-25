"use client";
import { useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCartIcon,
  WalletMinimal,
} from "lucide-react";
import Link from "next/link";

import { ProductWithRelationsType } from "@packages/ui";
import Ratings from "../ratings";
import { useStore } from "@/store";
import { useUser } from "@/hooks/use-user";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useDeviceTracking } from "@/hooks/use-device-tracking";

type Props = {
  product: ProductWithRelationsType;
};

export const ProductDetails = ({ product }: Props) => {
  const [currentImage, setCurrentImage] = useState(product?.images[0].url);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isColorSelected, setIsColorSelected] = useState(
    product?.colors?.[0] || "",
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    product?.sizes?.[0] || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([product?.sale_price, 1199]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const { addToWishlist, addToCart, removeFromWishlist, wishlist, cart } =
    useStore();
  const isWishListed = wishlist.some((item) => item.id === product?.id);
  const isInCart = cart.some((item) => item.id === product?.id);

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(product?.images[currentIndex - 1].url);
    }
  };

  const nextImage = () => {
    if (currentIndex < product?.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(product?.images[currentIndex + 1].url);
    }
  };

  const discountPercentage =
    product?.regular_price && product?.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100,
        )
      : 0;
  return (
    <div className="w-full bg-[#f5f5f5] py-5 font-Poppins">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid  grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        <div className="p-4">
          <div className="relative w-full">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: "Product Image",
                  isFluidWidth: true,
                  src: currentImage,
                },
                largeImage: {
                  src: currentImage,
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: "150%",
                  height: "150%",
                },
                enlargedImageStyle: {
                  border: "none",
                  boxShadow: "none",
                },
                enlargedImagePosition: "right",
              }}
            />
          </div>

          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {product?.images.length > 0 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="flex gap-2 overflow-x-auto">
              {product?.images?.map((img, index) => (
                <Image
                  key={index + 1}
                  src={img.url}
                  alt="thumnbail"
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${currentImage === img?.url ? "border-blue-500" : "border-gray-300"}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(img?.url);
                  }}
                />
              ))}
            </div>
            {product?.images.length > 0 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === product?.images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{product?.title}</h1>

          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={product?.ratings} />

              <Link href="#reviews" className="text-blue-500 hover:underline">
                (0 Reviews)
              </Link>
            </div>

            <div>
              <Heart
                size={25}
                onClick={() =>
                  isWishListed
                    ? removeFromWishlist(product.id, user, location, deviceInfo)
                    : addToWishlist(
                        {
                          ...product,
                          quantity,
                          selectedOptions: {
                            color: isColorSelected,
                            size: isSizeSelected,
                          },
                        },
                        user,
                        location,
                        deviceInfo,
                      )
                }
                fill={isWishListed ? "red" : "transparent"}
                stroke={isWishListed ? "red" : "#4b5563"}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">
              Brand:
              <span className="text-blue-500">
                {product?.brand || "No Brand"}
              </span>
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${product?.sale_price}
            </span>

            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${product?.regular_price}
              </span>

              <span className="text-gray-500">-{discountPercentage}%</span>
            </div>

            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {product?.colors?.length > 0 && (
                  <div className="">
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {product?.colors?.map((color, index) => (
                        <button
                          key={index + 1}
                          className={`w-7 h-7 cursor-pointer rounded-full border-2 transition ${isColorSelected === color ? "border-gray-400 scale-110 shadow-md" : "border-transparent"}`}
                          onClick={() => setIsColorSelected(color)}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product?.sizes?.length > 0 && (
                  <div className="">
                    <strong>Size:</strong>

                    <div className="flex gap-2 mt-1">
                      {product?.sizes?.map((size, index) => (
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
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3">
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

                {product?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock
                    <span className="text-gray-500 font-medium">
                      (Stock {product?.stock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>

              <button
                className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? "cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isInCart}
                onClick={() =>
                  addToCart(
                    {
                      ...product,
                      quantity,
                      selectedOptions: {
                        color: isColorSelected,
                        size: isSizeSelected,
                      },
                    },
                    user,
                    location,
                    deviceInfo,
                  )
                }
              >
                <ShoppingCartIcon size={18} />
                Add to cart
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Option</span>
            <div className="flex items-center text-gray-600 gap-1">
              <MapPin size={16} className="ml-[-5px]" />

              <span className="font-normal text-sm">
                {location?.city + ", " + location?.country}
              </span>
            </div>
          </div>

          <div className="mb-1 px-3 pb-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>

            <div className="flex items-center text-gray-600 gap-1">
              <Package size={16} className="-ml-1.5" />

              <span className="font-normal text-sm">7 Days Return</span>
            </div>

            <div className="flex items-center py-2 text-gray-600 gap-1">
              <WalletMinimal size={16} className="-ml-1.5" />

              <span className="text-sm font-normal">Warrany not available</span>
            </div>
          </div>

          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-green-600 font-light">
                    Sold by
                  </span>

                  <span className="block max-w-[150px] truncate font-medium text-lg">
                    {product?.shop?.name}
                  </span>
                </div>

                <Link
                  href="#"
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText size={16} />
                  Chat Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
