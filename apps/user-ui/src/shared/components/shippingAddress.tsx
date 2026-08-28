"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { countries } from "@/utils/countries";
import axiosInstance from "@/utils/axiosInstance";
import {
  CreateUserAddressResponseType,
  DeleteUserAddressResponseType,
  GetUserAddressResponseType,
} from "@packages/ui";

type FormData = {
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: string | boolean;
};

const fetchUserAddress = async () => {
  const response = await axiosInstance.get<GetUserAddressResponseType>(
    `/api/users/shipping-address`,
  );

  return response.data?.addresses;
};

const createUserAddress = async (payload: FormData) => {
  const response = await axiosInstance.post<CreateUserAddressResponseType>(
    "/api/users/shipping-address",
    payload,
  );
  return response?.data?.address;
};

const deleteUserAddress = async (id: string) => {
  await axiosInstance.delete<DeleteUserAddressResponseType>(
    `/api/users/shipping-address/${id}`,
  );
};

export const ShippingAddress = () => {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "Bangladesh",
      isDefault: "false",
    },
  });

  const { data: addresses, isLoading: isUserAddressLoading } = useQuery({
    queryKey: ["user-shipping-addresses"],
    queryFn: fetchUserAddress,
  });

  const { mutate: addAddress } = useMutation({
    mutationFn: createUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-shipping-addresses"] });
      reset();
      setShowModal(false);
    },
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: deleteUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-shipping-addresses"] });
    },
  });

  const onSubmit = (data: FormData) => {
    addAddress({
      ...data,
      isDefault: data?.isDefault === "true",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>

        <button
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div>
        {isUserAddressLoading ? (
          <p className="text-sm text-gray-500">Loading Addresses...</p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-gray-600">No saved addresses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-md p-4 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />

                  <div className="">
                    <p className="font-medium">
                      {address?.label} - {address?.name}
                    </p>

                    <p>
                      {address?.street}, {address?.city}, {address?.zip},{" "}
                      {address?.country}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-1 !cursor-pointer text-xs text-red-50"
                    onClick={() => deleteAddress(address?.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-[110]">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Address
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <select
                {...register("label")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>

              <div>
                <input
                  placeholder="Name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  placeholder="Street"
                  {...register("street", { required: "Street is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  placeholder="City"
                  {...register("city", { required: "City is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <input
                placeholder="ZIP Code"
                {...register("zip", { required: "ZIP code is required" })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                {...register("country")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                {...register("isDefault")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Set as Default</option>
                <option value="false">Not Default</option>
              </select>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
