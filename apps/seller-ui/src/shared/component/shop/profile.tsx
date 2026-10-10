"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  Calendar,
  Clock,
  CloudUpload,
  Globe,
  MapPin,
  Pencil,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import axiosInstance from "@/utils/axiosInstance";
import {
  ButtonLoader,
  GetSellerEventsByUserResponseType,
  GetSellerProductsByUserResponseType,
  ShopType,
} from "@packages/ui";
import { ProductCard } from "../cards/productCard";

const TABS = ["Products", "Offers", "Reviews"];

const CARD = "bg-slate-800 border border-slate-700/60 rounded-lg shadow-lg";

type Props = {
  shop: ShopType;
  followersCount: number;
  sellerId: string;
};

type UploadTarget = "avatar" | "cover";

type ImageUploadModalProps = {
  title: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (base64Image: string) => void;
};

const ImageUploadModal = ({
  title,
  isSaving,
  onClose,
  onSave,
}: ImageUploadModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isSaving]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5MB or smaller.");
      toast("Image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => !isSaving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="text-slate-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex h-52 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-slate-600 bg-slate-900/60 text-sm text-slate-400 transition-colors hover:border-blue-500 hover:text-slate-200"
        >
          {preview ? (
            <img
              src={preview}
              alt="Selected preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <>
              <CloudUpload size={28} />
              <span>Click to upload</span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={!preview || isSaving}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Reset
          </button>

          <button
            onClick={() => preview && onSave(preview)}
            disabled={!preview || isSaving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving && <ButtonLoader size={16} />}
            {isSaving ? "Saving..." : "Save image"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerProfile = ({ shop, followersCount, sellerId }: Props) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Products");
  const [followers] = useState(followersCount);

  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(shop?.avatar);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    shop?.coverBanner,
  );

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

  const uploadMutation = useMutation({
    mutationFn: async ({
      target,
      image,
    }: {
      target: UploadTarget;
      image: string;
    }) => {
      const endpoint =
        target === "avatar"
          ? `/api/sellers/shops/avatar`
          : `/api/sellers/shops/cover-banner`;

      const res = await axiosInstance.post(endpoint, {
        fileName: image,
      });
      return { target, image, url: res.data?.avatar ?? res.data?.coverBanner };
    },
    onSuccess: ({ target, image, url }) => {
      queryClient.invalidateQueries({ queryKey: ["shop-details", sellerId] });

      const finalUrl = url ?? image;
      if (target === "avatar") setAvatarUrl(finalUrl);
      else setCoverUrl(finalUrl);
      setUploadTarget(null);
    },
    onError: (err) => {
      const fallback = "Something went wrong.Please try again later";

      const error = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? fallback)
        : fallback;
      toast(error);
    },
  });

  return (
    <div>
      {/* Cover */}
      <div className="relative w-full flex justify-center">
        <Image
          src={
            coverUrl ||
            "https://ik.imagekit.io/fzoxzwtey/cover/1200%20x%20300.svg?updatedAt=1742..."
          }
          alt="Seller Cover"
          className="w-full h-40 sm:h-64 lg:h-[400px] object-cover"
          width={1200}
          height={300}
        />

        <button
          onClick={() => setUploadTarget("cover")}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-slate-900"
        >
          <Pencil size={14} />
          Edit Cover
        </button>
      </div>

      {/* Seller Info Section */}
      <div className="w-[92%] sm:w-[85%] lg:w-[70%] mt-[-40px] sm:mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className={`${CARD} p-4 sm:p-6 flex-1`}>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-[100px] h-[100px] shrink-0">
              <div className="relative h-full w-full rounded-full border-4 border-slate-600 overflow-hidden">
                <Image
                  src={
                    avatarUrl ||
                    "https://ik.imagekit.io/fzoxzwtey/avatar/amazon.jpeg"
                  }
                  alt="Seller Avatar"
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              <button
                onClick={() => setUploadTarget("avatar")}
                aria-label="Edit profile picture"
                className="absolute bottom-0 right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-blue-600 text-white transition-colors hover:bg-blue-500"
              >
                <Pencil size={13} />
              </button>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row md:items-start md:justify-between md:gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold text-white break-words">
                  {shop?.name}
                </h1>

                <Link
                  href="/dashboard/shop/edit"
                  className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-600 mt-5"
                >
                  <Pencil size={14} />
                  Edit Profile
                </Link>
              </div>

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
              className={`shrink-0 whitespace-nowrap py-3 px-4 sm:px-6 text-base sm:text-lg font-semibold border-b-2 -mb-px transition-colors ${
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
            <div className="m-auto grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4">
              {isLoading &&
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-slate-700/50 animate-pulse rounded-xl"
                  ></div>
                ))}
              {products?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${product?.slug}`}
                />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No products available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="m-auto grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-4">
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
                  href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${product?.slug}`}
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

      {/* Upload modals */}
      {uploadTarget && (
        <ImageUploadModal
          title={
            uploadTarget === "avatar"
              ? "Edit Profile Picture"
              : "Edit Cover Photo"
          }
          isSaving={uploadMutation.isPending}
          onClose={() => setUploadTarget(null)}
          onSave={(image) =>
            uploadMutation.mutate({ target: uploadTarget, image })
          }
        />
      )}
    </div>
  );
};

export default SellerProfile;
