/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { ChevronRight, Wand, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  AllDiscountCodeResponseType,
  ProductType,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { ImagePlaceholder } from "@/shared/component/image-placeholder";
import { enhancements } from "@/utils/ai-enhancements";

interface UploadedImage {
  fileId: string;
  fileUrl: string;
  isExisting?: boolean;
}

type ProductFormProps = {
  isEvent?: boolean;
  product?: ProductType | null;
  mode?: "create" | "edit";
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const mapProductImages = (
  product?: ProductType | null,
): (UploadedImage | null)[] => {
  if (!product) return [null];

  const mapped: (UploadedImage | null)[] = (product.images || []).map(
    (image) => ({
      fileId: image.file_id,
      fileUrl: image.url,
      isExisting: true,
    }),
  );

  if (mapped.length === 0) return [null];

  if (mapped.length < 8) {
    mapped.push(null);
  }

  return mapped;
};

const ProductForm = ({
  isEvent = false,
  product = null,
  mode = "create",
}: ProductFormProps) => {
  const isEdit = mode === "edit" && Boolean(product);
  const initialImages = useMemo(() => mapProductImages(product), [product]);
  const defaultValues = useMemo(
    () => ({
      title: product?.title ?? "",
      short_description: product?.short_description ?? "",
      detailed_description: product?.detailed_description ?? "",
      warranty: product?.warranty ?? "",
      slug: product?.slug ?? "",
      tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
      brand: product?.brand ?? "",
      cash_on_delivery: product?.cashOnDelivery ?? "yes",
      video_url: product?.video_url ?? "",
      category: product?.category ?? "",
      subCategory: product?.subCategory ?? "",
      regular_price: product?.regular_price ?? "",
      sale_price: product?.sale_price ?? "",
      stock: product?.stock ?? "",
      colors: product?.colors ?? [],
      sizes: product?.sizes ?? [],
      discountCodes: product?.discount_codes ?? [],
      customProperties: Array.isArray(product?.custom_properties)
        ? product.custom_properties
        : [],
      custom_specifications: Array.isArray(product?.custom_specifications)
        ? product.custom_specifications
        : [],
      starting_date: toDateInputValue(product?.starting_date),
      ending_date: toDateInputValue(product?.ending_date),
      images: initialImages,
    }),
    [product, initialImages],
  );

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({ defaultValues });
  const router = useRouter();
  const queryClient = useQueryClient();

  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pictureUploadingLoader, setPictureUploadingLoader] =
    useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [images, setImages] =
    useState<(UploadedImage | null)[]>(initialImages);
  const [removedImageFileIds, setRemovedImageFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const deleteUploadedImage = async (fileId: string) => {
    await axiosInstance.delete(`/api/products/product-image`, {
      data: { fileId },
    });
  };

  const stageImageRemoval = (fileId: string) => {
    setRemovedImageFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId],
    );
  };

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
  const startDate = watch("starting_date");

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

      const response = await axiosInstance.post(`/api/products/product-image`, {
        fileName,
      });
      const uploadedImage: UploadedImage = {
        fileId: response.data?.fileId,
        fileUrl: response.data?.fileUrl,
      };

      const previousImage = images[index];

      if (previousImage && typeof previousImage === "object") {
        if (isEdit && previousImage.isExisting) {
          stageImageRemoval(previousImage.fileId);
        } else {
          try {
            await deleteUploadedImage(previousImage.fileId);
          } catch (err) {
            console.log(err);
          }
        }
      }

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
      const imageToDelete = images[index];

      if (imageToDelete && typeof imageToDelete === "object") {
        if (isEdit && imageToDelete.isExisting) {
          stageImageRemoval(imageToDelete.fileId);
        } else {
          try {
            await deleteUploadedImage(imageToDelete.fileId);
          } catch (err) {
            console.log(err);
          }
        }
      }

      const updatedImages = [...images];
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

  const onSubmit = async (data: any) => {
    const validImages = Array.isArray(data.images)
      ? data.images.filter(
          (image: UploadedImage | null) => image?.fileId && image?.fileUrl,
        )
      : [];

    if (validImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...data,
        images: validImages,
        starting_date: isEvent ? data.starting_date : undefined,
        ending_date: isEvent ? data.ending_date : undefined,
      };

      if (isEdit && product) {
        await axiosInstance.put(`/api/products/${product.id}`, payload);

        if (removedImageFileIds.length > 0) {
          await Promise.allSettled(
            removedImageFileIds.map((fileId) => deleteUploadedImage(fileId)),
          );
        }

        queryClient.invalidateQueries({ queryKey: ["shop-products"] });
        queryClient.invalidateQueries({ queryKey: ["shop-events"] });

        toast.success(isEvent ? "Event updated" : "Product updated");
        router.push(isEvent ? "/dashboard/all-events" : "/dashboard/all-products");
      } else {
        await axiosInstance.post(`/api/products`, payload);
        queryClient.invalidateQueries({
          queryKey: [isEvent ? "shop-events" : "shop-products"],
        });
        router.push(
          isEvent ? "/dashboard/all-events" : "/dashboard/all-products",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = isEvent ? "Event" : "Product";
  const actionTitle = isEdit ? `Edit ${pageTitle}` : `Create ${pageTitle}`;

  return (
    <form
      className="w-full mx-auto p-4 sm:p-6 lg:p-8 shadow-md rounded-lg text-white font-Poppins"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-xl sm:text-2xl py-2 font-semibold font-Poppins">
        {actionTitle}
      </h2>

      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dasboard</span>

        <ChevronRight size={20} className="opacity-[.8]" />
        <span>{actionTitle}</span>
      </div>

      <div className="py-4 w-full flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              pictureUploadingLoader={pictureUploadingLoader}
              small={false}
              images={images}
              setSelectedImage={setSelectedImage}
              index={0}
              defaultImage={images[0]?.fileUrl ?? null}
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
                defaultImage={images[index + 1]?.fileUrl ?? null}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-[65%]">
          <div className="w-full flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-2/4">
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
                  placeholder="product-slug"
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
                <CustomProperties
                  control={control}
                  errors={errors}
                  defaultProperties={
                    (defaultValues.customProperties as {
                      label: string;
                      values: string[];
                    }[]) || []
                  }
                />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash on Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
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

            <div className="w-full md:w-2/4">
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

              {/* ---- The only real difference: event date fields ---- */}
              {isEvent && (
                <div className="mt-2 flex gap-3">
                  <div className="w-1/2 min-w-0">
                    <Input
                      type="date"
                      label="Start Date *"
                      {...register("starting_date", {
                        required: isEvent ? "Start date is required" : false,
                      })}
                    />
                    {errors.starting_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.starting_date.message)}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2 min-w-0">
                    <Input
                      type="date"
                      label="End Date *"
                      {...register("ending_date", {
                        required: isEvent ? "End date is required" : false,
                        validate: (value) => {
                          if (!isEvent) return true;
                          if (!startDate || !value) return true;
                          return (
                            new Date(value) > new Date(startDate) ||
                            "End date must be after start date"
                          );
                        },
                      })}
                    />
                    {errors.ending_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {String(errors.ending_date.message)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* ------------------------------------------------------ */}

              {(isDiscountLoading || discountCodes.length > 0) && (
                <div className="mt-3">
                  <label className="block font-semibold text-gray-300 mb-1 text-sm">
                    Select Discount Codes (Optional)
                  </label>
                  {isDiscountLoading ? (
                    <p className="text-gray-400 text-xs">
                      Loading discount codes...
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {discountCodes.map((discountCode) => (
                        <button
                          key={discountCode.id}
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                            watch("discountCodes")?.includes(discountCode.id)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                          }`}
                          onClick={() => {
                            const currentSelection =
                              watch("discountCodes") || [];
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
                          {discountCode.discountType === "percentage"
                            ? "%"
                            : "$"}
                          )
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed inset-0 p-4 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-[450px] max-h-[90dvh] overflow-y-auto text-white">
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
        {/*{isChanged && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}*/}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          disabled={loading}
        >
          {loading
            ? isEdit
              ? "Saving..."
              : isEvent
                ? "Creating Event..."
                : "Creating..."
            : isEdit
              ? `Update ${pageTitle}`
              : isEvent
                ? "Create Event"
                : "Create"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
