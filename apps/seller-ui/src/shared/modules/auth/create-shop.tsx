import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";

import { shopCategories } from "@packages/ui";

type Props = {
  sellerId: string;
  setActiveStep: (step: number) => void;
};

type FormValues = {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website?: string;
  category: string;
};

export const CreateShop = ({ sellerId, setActiveStep }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/shop`,
        data,
      );

      return response.data;
    },

    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: FormValues) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s*/).length;
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-3xl font-Poppins font-semibold text-center mb-2">
          Setup new shop
        </h3>

        <label htmlFor="name" className="block text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("name", {
            required: "Name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        <label htmlFor="bio" className="block text-gray-700 mb-1">
          Bio (Max 100 words) *
        </label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("bio", {
            required: "Bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio cannot exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        <label htmlFor="address" className="block text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          placeholder="shop location"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("address", {
            required: "Shop Address is required",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        <label htmlFor="opening_hours" className="block text-gray-700 mb-1">
          Opening Hours *
        </label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("opening_hours", {
            required: "Opening hours is required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}

        <label htmlFor="website" className="block text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?@&%=+#]*)?$/,
              message: "Please enter a valid URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        <label htmlFor="category" className="block text-gray-700 mb-1">
          Category *
        </label>

        <select
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={shopCreateMutation.isPending}
          className="w-full text-base cursor-pointer mt-4 bg-blue-500 text-white py-2 rounded-lg"
        >
          {shopCreateMutation.isPending ? "Creating ..." : "Create"}
        </button>
      </form>
    </div>
  );
};
