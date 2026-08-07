/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { ChevronRight, Wand, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Input,
  ColorSelector,
  CustomSpecifications,
  CustomProperties,
  RichTextEditor,
  SizeSelector,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { AllDiscountCodeResponseType } from "@/types/api.type";
import { ImagePlaceholder } from "@/shared/component/image-placeholder";
import { enhancements } from "@/utils/ai-enhancements";

interface UploadedImage {
  fileId: string;
  fileUrl: string;
}

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [isChanged, setIsChanges] = useState<boolean>(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pictureUploadingLoader, setPictureUploadingLoader] =
    useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`api/products/categories`);

        return res.data;
      } catch (err) {
        console.log(err);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || [];

  const { data: discountCodes = [], isLoading: isDiscountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get<AllDiscountCodeResponseType>(
        `/api/products/discount-code`,
      );
      return res?.data?.discount_codes || [];
    },
  });

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    setPictureUploadingLoader(true);

    try {
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post(
        `/api/products/upload-product-image`,
        { fileName },
      );
      const uploadedImage: UploadedImage = {
        fileId: response.data?.fileId,
        fileUrl: response.data?.fileUrl,
      };

      const updatedImages = [...images];
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (err) {
      console.log(err);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete(`/api/products/product-image`, {
          data: {
            fileId: imageToDelete.fileId,
          },
        });
      }

      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (err) {
      console.log(err);
    }
  };

  const applyTransformation = (transformation: string) => {
    if (!selectedImage || processing) return;

    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (err) {
      console.log(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = async () => {};

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/products`, data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins">
        Create Product
      </h2>

      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dasboard</span>

        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      <div className="py-4 w-full flex gap-6">
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              pictureUploadingLoader={pictureUploadingLoader}
              small={false}
              images={images}
              setSelectedImage={setSelectedImage}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                key={index + 1}
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                pictureUploadingLoader={pictureUploadingLoader}
                small
                images={images}
                setSelectedImage={setSelectedImage}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />

              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.title.message)}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  className="resize-none"
                  {...register("short_description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s*/).length;

                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (current: ${wordCount})`
                      );
                    },
                  })}
                />

                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.short_description.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register("tags", {
                    required: "Seperated related products tags with a coma,",
                  })}
                />

                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.tags.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty is required",
                  })}
                />

                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.warranty.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Use only lowercase letters, numbers, and hyphens.",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long.",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot be longer than 50 characters.",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.slug.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  className=""
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />

                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.brand.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash on Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.cash_on_delivery.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1 text-sm">
                Category *
              </label>

              {isLoading ? (
                <p className="text-gray-400 text-xs">Laoding categories...</p>
              ) : isError ? (
                <p className="text-red-500 text-xs">
                  Failed to load categories
                </p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is reqired." }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>

                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-black text-white"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}

              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.category.message)}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Subcategory *
                </label>

                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is reqired." }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Sub category
                      </option>

                      {subCategories?.map((subCategory: string) => (
                        <option
                          value={subCategory}
                          key={subCategory}
                          className="bg-black"
                        >
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.subCategory.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Detailed Description * (Min 100 words)
                </label>

                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const div = document.createElement("div");
                      div.innerHTML = value || "";

                      const text = div.textContent || "";

                      const wordCount = text
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length;

                      return (
                        wordCount >= 100 ||
                        "Description must be at least 100 words!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.detailed_description.message)}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/watch?v=xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(\S*)?$/,
                      message:
                        "Invalid YouTube URL! Use a link like https://www.youtube.com/watch?v=xyz123 or https://youtu.be/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15$"
                  {...register("sale_price", {
                    required: "Sale Price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Sale Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed!";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1 text-sm">
                  Select Discount Codes(Optional)
                </label>

                {isDiscountLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes.map((discountCode) => (
                      <button
                        key={discountCode.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch("discountCodes")?.includes(discountCode.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"}`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(
                            discountCode.id,
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== discountCode.id,
                              )
                            : [...currentSelection, discountCode.id];
                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {discountCode?.public_name} (
                        {discountCode.discountValue}
                        {discountCode.discountType === "percentage" ? "%" : "$"}
                        )
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>

            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image src={selectedImage} alt="product-image" layout="fill" />
            </div>

            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>

                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                  {enhancements.map(({ label, effect }) => (
                    <button
                      type="button"
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${activeEffect === effect ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => applyTransformation(effect)}
                    >
                      <Wand size={18} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
