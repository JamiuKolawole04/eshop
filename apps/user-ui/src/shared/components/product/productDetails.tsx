"use client";
import { useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import Image from "next/image";

import { ProductWithRelationsType } from "@packages/ui";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Ratings from "../ratings";
import Link from "next/link";

type Props = {
  product: ProductWithRelationsType;
};

export const ProductDetails = ({ product }: Props) => {
  const [currentImage, setCurrentImage] = useState(product?.images[0].url);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    Math.round(
      (product?.regular_price - product?.sale_price) / product?.regular_price,
    ) * 100;

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
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
                fill="red"
                className="cursor-pointer"
                color="transparent"
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

              <span className="text-gray-500">-73%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
