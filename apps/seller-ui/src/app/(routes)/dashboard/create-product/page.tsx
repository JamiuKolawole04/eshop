"use client";

import { ImagePlaceholder } from "@/shared/component/image-placeholder";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  ColorSelector,
  CustomSpecifications,
  Input,
} from "@packages/components";

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanges] = useState<boolean>(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = () => {};

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });

    setValue("images", images);
  };
  return (
    <form className="w-full mx-auto p-8 shadow-md rounded-lg text-white">
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
              size="765 * 850"
              small={false}
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
                size="765 * 850"
                small
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
                  {...register("description", {
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

                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.description.message)}
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
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
