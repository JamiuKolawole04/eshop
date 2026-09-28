"use client";

import { useQuery } from "@tanstack/react-query";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Calendar, Clock, Globe, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import {
  GetSellerEventsByUserResponseType,
  GetSellerProductsByUserResponseType,
  ShopType,
} from "@packages/ui";
import { ProductCard } from "./cards/productCard";

const TABS = ["Products", "Offers", "Reviews"];

const CARD = "bg-slate-800 border border-slate-700/60 rounded-lg shadow-lg";

type Props = {
  shop: ShopType;
  followersCount: number;
};

const SellerProfile = ({ shop, followersCount }: Props) => {
  const [activeTab, setActiveTab] = useState("Products");
  const [followers] = useState(followersCount);

  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products", shop?.id],
    queryFn: async () => {
      const res = await axiosInstance.get<GetSellerProductsByUserResponseType>(
        `/api/sellers/shops/${shop?.id}/products?page=1&limit=10`,
      );
      return res.data.products;
    },
    enabled: !!shop?.id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events", shop?.id],
    queryFn: async () => {
      const res = await axiosInstance.get<GetSellerEventsByUserResponseType>(
        `/api/sellers/shops/${shop?.id}/events?page=1&limit=10`,
      );
      return res.data.products;
    },
    enabled: !!shop?.id,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div>
      <div className="relative w-full flex justify-center">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/fzoxzwtey/cover/1200%20x%20300.svg?updatedAt=1742..."
          }
          alt="Seller Cover"
          className="w-full h-[400px] object-cover"
          width={1200}
          height={300}
        />
      </div>

      {/* Seller Info Section */}
      <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
        <div className={`${CARD} p-6 flex-1`}>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-[100px] h-[100px] shrink-0 rounded-full border-4 border-slate-600 overflow-hidden">
              <Image
                src={
                  shop?.avatar ||
                  "https://ik.imagekit.io/fzoxzwtey/avatar/amazon.jpeg"
                }
                alt="Seller Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-2xl font-semibold text-white">
                {shop?.name}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {shop?.bio || "No bio available."}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-blue-400 gap-1">
                  <Star fill="#60a5fa" size={18} />{" "}
                  <span>{shop?.ratings || "N/A"}</span>
                </div>
                <div className="flex items-center text-slate-400 gap-1">
                  <Users size={18} /> <span>{followers} Followers</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-slate-400">
                <Clock size={18} />
                <span>{shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM"}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 text-slate-400">
                <MapPin size={18} />{" "}
                <span>{shop?.address || "No address provided"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${CARD} p-6 w-full lg:w-[30%]`}>
          <h2 className="text-xl font-semibold text-white">Shop Details</h2>

          <div className="flex items-center gap-3 mt-3 text-slate-400">
            <Calendar size={18} />
            <span>
              Joined At: {new Date(shop?.createdAt).toLocaleDateString()}
            </span>
          </div>

          {shop?.website && (
            <div className="flex items-center gap-3 mt-3 text-slate-400">
              <Globe size={18} />
              <Link
                href={shop?.website}
                className="hover:underline text-blue-400 break-all"
              >
                {shop?.website}
              </Link>
            </div>
          )}

          {shop?.socialLinks && shop?.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-slate-300 text-lg font-medium">Follow Us:</h3>
              <div className="flex gap-3 mt-2 text-slate-300">
                {shop?.socialLinks?.map((link, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-90 hover:text-white"
                  >
                    {link.type === "youtube" && <FaYoutube size={20} />}
                    {link.type === "x" && <FaXTwitter size={20} />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "text-white border-blue-500"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`${CARD} my-4 text-slate-400`}>
          {activeTab === "Products" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isLoading &&
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-slate-700/50 animate-pulse rounded-xl"
                  ></div>
                ))}
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No products available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isEventsLoading &&
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-slate-700/50 animate-pulse rounded-xl"
                  ></div>
                ))}
              {events?.map((product) => (
                <ProductCard
                  isEvent={true}
                  key={product.id}
                  product={product}
                />
              ))}
              {events?.length === 0 && (
                <p className="py-2">No offers available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div>
              <p className="text-center py-5">No Reviews available yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
