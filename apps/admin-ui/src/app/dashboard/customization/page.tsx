"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

import { BreadCrumbs } from "@/shared/components/breadcrumbs";
import { WebsiteCustomizationResponse } from "@/types/customization";
import axiosInstance from "@/utils/axiosInstance";
import { ButtonLoader } from "@packages/ui";

const tabs = ["Categories", "Logo", "Banner"];

const fetchCustomization = async () => {
  const res = await axiosInstance.get<WebsiteCustomizationResponse>(
    "/api/admin/customizations",
  );
  return res.data;
};

const Customization = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Categories");

  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customization"],
    queryFn: fetchCustomization,
  });

  const categories = data?.categories ?? [];
  const subCategories = data?.subCategories ?? {};
  const logo = data?.logo ?? null;
  const banner = data?.banner ?? null;

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const addCategoryMutation = useMutation({
    mutationFn: async (updatedCategories: string[]) => {
      const res = await axiosInstance.put("/api/admin/add-category", {
        categories: updatedCategories,
      });
      return res.data;
    },
    onSuccess: (_, updatedCategories) => {
      queryClient.setQueryData<WebsiteCustomizationResponse>(
        ["customization"],
        (old) => (old ? { ...old, categories: updatedCategories } : old),
      );
      setNewCategory("");
    },
    onError: (error) => {
      console.error("Error adding category", error);
    },
  });

  const addSubCategoryMutation = useMutation({
    mutationFn: async (updatedSubCategories: Record<string, string[]>) => {
      const res = await axiosInstance.put("/api/admin/add-subcategory", {
        subCategories: updatedSubCategories,
      });
      return res.data;
    },
    onSuccess: (_, updatedSubCategories) => {
      queryClient.setQueryData<WebsiteCustomizationResponse>(
        ["customization"],
        (old) => (old ? { ...old, subCategories: updatedSubCategories } : old),
      );
      setNewSubCategory("");
    },
    onError: (error) => {
      console.error("Error adding subcategory", error);
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/admin/api/upload-logo", formData);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<WebsiteCustomizationResponse>(
        ["customization"],
        (old) => (old ? { ...old, logo: data.logo } : old),
      );
    },
    onError: (error) => {
      console.error("Error uploading logo", error);
    },
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(
        "/admin/api/upload-banner",
        formData,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<WebsiteCustomizationResponse>(
        ["customization"],
        (old) => (old ? { ...old, banner: data.banner } : old),
      );
    },
    onError: (error) => {
      console.error("Error uploading banner", error);
    },
  });

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategoryMutation.mutate([...categories, newCategory]);
  };

  const handleAddSubCategory = () => {
    if (!newSubCategory.trim() || !selectedCategory) return;

    const updatedSubCategories = {
      ...subCategories,
      [selectedCategory]: [
        ...(subCategories[selectedCategory] || []),
        newSubCategory,
      ],
    };

    addSubCategoryMutation.mutate(updatedSubCategories);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 font-poppins">
        <ButtonLoader size={28} className="text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen p-8 text-red-400">
        Failed to load customization settings.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-8 font-poppins">
      <h2 className="text-2xl text-white font-semibold mb-2">Customization</h2>

      <BreadCrumbs title="Customization" />

      <div className="flex items-center gap-6 mt-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {/* Categories Tab */}
        {activeTab === "Categories" && (
          <div>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h3 className="font-semibold text-white">{category}</h3>
                <ul className="pl-4 list-disc text-sm text-gray-300">
                  {(subCategories[category] || []).map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Add Category */}
            <div className="pt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
              />

              <button
                onClick={handleAddCategory}
                disabled={addCategoryMutation.isPending}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md disabled:opacity-50"
              >
                {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
              </button>
            </div>

            {/* Add Subcategory */}
            <div className="pt-4 flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="New subcategory"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
              />

              <button
                onClick={handleAddSubCategory}
                disabled={addSubCategoryMutation.isPending}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md disabled:opacity-50"
              >
                {addSubCategoryMutation.isPending
                  ? "Adding..."
                  : "Add Subcategory"}
              </button>
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === "Logo" && (
          <div>
            {logo && (
              <img
                src={logo}
                alt="Logo"
                className="w-40 h-40 object-contain mb-4 bg-white p-2 rounded-md"
              />
            )}

            <input
              type="file"
              accept="image/*"
              disabled={uploadLogoMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                uploadLogoMutation.mutate(file);
              }}
              className="text-sm text-white"
            />
          </div>
        )}

        {/* Banner Tab */}
        {activeTab === "Banner" && (
          <div>
            {banner && (
              <img
                src={banner}
                alt="Banner"
                className="w-full max-w-2xl object-cover mb-4 rounded-md"
              />
            )}

            <input
              type="file"
              accept="image/*"
              disabled={uploadBannerMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                uploadBannerMutation.mutate(file);
              }}
              className="text-sm text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Customization;
