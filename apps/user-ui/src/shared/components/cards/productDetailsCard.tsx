import { useState } from "react";

import { ProductWithRelationsType } from "@packages/ui";
import Image from "next/image";

type Props = {
  data: ProductWithRelationsType;
  setIsOpen: (open: boolean) => void;
};

export const ProductDetailsCard = ({ data, setIsOpen }: Props) => {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
