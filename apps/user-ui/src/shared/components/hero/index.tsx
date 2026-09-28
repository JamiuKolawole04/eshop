"use client";

import useLayout from "@/hooks/use-layout";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const router = useRouter();
  const { layout } = useLayout();

  return (
    <div className="bg-[#115061] min-h-[70vh] md:h-[85vh] py-10 md:py-0 flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto flex flex-col md:flex-row gap-8 md:gap-0 h-full items-center">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <p className="font-Roboto font-normal text-white pb-2 text-base sm:text-xl">
            Starting from $40
          </p>

          <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold font-Roboto">
            The best watch <br /> collection 2026
          </h1>

          <p className="font-oregano text-xl sm:text-2xl lg:text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off
            this week
          </p>

          <br />

          <button
            onClick={() => router.push("/products")}
            className="w-[140px] mx-auto md:mx-0 flex items-center font-Roboto justify-center text-sm gap-2 font-semibold h-[40px] hover:text-white bg-white hover:bg-transparent rounded-sm"
          >
            Shop Now <MoveRight />
          </button>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src={
              layout?.banner ||
              "https://ik.imagekit.io/jnven3dnh3/eshop-products/watch.png"
            }
            alt="product"
            width={450}
            height={450}
            className="w-[220px] sm:w-[320px] lg:w-[450px] h-auto"
          />
        </div>
      </div>
    </div>
  );
};
