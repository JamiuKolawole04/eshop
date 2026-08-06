"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";

import { AllDiscountCodeResponseType, DiscountCode } from "@/types/api.type";
import axiosInstance from "@/utils/axiosInstance";
import { Input } from "@packages/ui";
import { AxiosError } from "axios";
import { DeleteDiscountCodeModal } from "@/shared/component/modals/delete-discount-modal";

const defaultValues = {
  public_name: "",
  discountType: "percentage",
  discountValue: "",
  discountCode: "",
};

type DiscountFormValues = typeof defaultValues;

const Page = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode>();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get<AllDiscountCodeResponseType>(
        `/api/products/discount-code`,
      );
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: DiscountFormValues) => {
      await axiosInstance.post(`/api/products/discount-code`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.delete(`/api/products/discount-code/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
    },
  });

  const handleDeleteDiscount = (discount: DiscountCode) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = (data: DiscountFormValues) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }

    createDiscountCodeMutation.mutate(data);
  };
  return (
    <div className="w-full min-h-screen p-8 font-Poppins">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>

      <div className="flex items-center text-white">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dasboard
        </Link>

        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-base font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center text-xs">
            Loading discounts...
          </p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800 text-sm">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
              </tr>
            </thead>

            <tbody>
              {discountCodes.map((discount) => (
                <tr
                  key={discount.id}
                  className="border-b border-gray-800 hover:bg-gray-800 translate text-sm"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3">
                    {discount?.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Fiat {$}"}
                  </td>
                  <td className="p-3">
                    {discount?.discountType === "percentage"
                      ? `${discount?.discountValue}%`
                      : `$${discount?.discountValue}`}
                  </td>
                  <td className="p-3">{discount?.discountCode}</td>
                  <td className="p-3">
                    <button
                      className="text-red-400 hover:text-red-300 transition"
                      onClick={() => handleDeleteDiscount(discount)}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && discountCodes?.length === 0 && (
          <p className="text-gray-400 pt-4 text-center text-sm">
            No Discount Codes Available
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create Discount Code</h3>

              <button
                className="text-gray-700 hover:text-white"
                onClick={() => setShowModal(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form className="mt-4 text-sm" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Title (Public Name)"
                {...register("public_name", { required: "Title is required" })}
              />
              {errors.public_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.public_name.message}
                </p>
              )}
              <div className="mt-4">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Fiat Amount ($)</option>
                    </select>
                  )}
                />

                {errors.discountType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  {...register("discountValue", {
                    required: "Value is required",
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "Discount Code is required",
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>
              <button
                disabled={createDiscountCodeMutation.isPending}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {createDiscountCodeMutation.isPending ? "Creating" : "Create"}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteDiscountCodeMutation.mutate(selectedDiscount?.id);
          }}
        />
        // <p>ok</p>
      )}
    </div>
  );
};

export default Page;
