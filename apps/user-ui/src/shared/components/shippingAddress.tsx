"use client";

import { countries } from "@/utils/countries";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const ShippingAddress = () => {
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

  const onSubmit = () => {};

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

      {/*Adress List*/}
      <div></div>

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
