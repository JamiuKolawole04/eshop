"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";

import axiosInstance from "@/utils/axiosInstance";
import { ButtonLoader, ShopType } from "@packages/ui";

const CARD = "bg-slate-800 border border-slate-700/60 rounded-lg shadow-lg";

const INPUT =
  "w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60";

const LABEL = "mb-1.5 block text-sm font-medium text-slate-300";

const MAX_BIO_WORDS = 100;

const SOCIAL_TYPES = [
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
] as const;

type SocialLink = {
  type: "youtube" | "x";
  url: string;
};

type Props = {
  shop: ShopType;
  sellerId: string;
};

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const EditProfile = ({ shop, sellerId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(shop?.name ?? "");
  const [bio, setBio] = useState(shop?.bio ?? "");
  const [openingHours, setOpeningHours] = useState(shop?.opening_hours ?? "");
  const [address, setAddress] = useState(shop?.address ?? "");
  const [website, setWebsite] = useState(shop?.website ?? "");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    (shop?.socialLinks as SocialLink[] | undefined) ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const bioWords = countWords(bio);

  const updateLink = (index: number, patch: Partial<SocialLink>) =>
    setSocialLinks((links) =>
      links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );

  const removeLink = (index: number) =>
    setSocialLinks((links) => links.filter((_, i) => i !== index));

  const addLink = () =>
    setSocialLinks((links) => [...links, { type: "youtube", url: "" }]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(`/api/sellers/shops/profile`, {
        name: name.trim(),
        bio: bio.trim(),
        opening_hours: openingHours.trim(),
        address: address.trim(),
        website: website.trim(),
        socialLinks: socialLinks
          .map((l) => ({ ...l, url: l.url.trim() }))
          .filter((l) => l.url),
      });
      return res.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["shop-details", sellerId],
        }),
        queryClient.invalidateQueries({ queryKey: ["seller-profile"] }),
      ]);
      router.push("/");
    },
    onError: (err) => {
      const fallback = "Could not save your changes. Please try again.";
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? fallback)
          : fallback,
      );
    },
  });

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Shop name is required.");
    if (bioWords > MAX_BIO_WORDS)
      return setError(`Bio must be ${MAX_BIO_WORDS} words or fewer.`);

    saveMutation.mutate();
  };

  const isSaving = saveMutation.isPending;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link
          href="/"
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>
        <span>/</span>
        <span className="text-slate-200">Edit Profile</span>
      </nav>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`${CARD} mx-auto mt-6 w-full max-w-xl p-5 sm:p-6`}
      >
        <h1 className="text-xl font-semibold text-white">Edit Shop Profile</h1>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="shop-name" className={LABEL}>
              Shop Name
            </label>
            <input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your shop name"
              disabled={isSaving}
              className={INPUT}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="shop-bio" className={LABEL}>
                Shop Bio (Max {MAX_BIO_WORDS} words)
              </label>
              <span
                className={`mb-1.5 text-xs ${
                  bioWords > MAX_BIO_WORDS ? "text-red-400" : "text-slate-500"
                }`}
              >
                {bioWords}/{MAX_BIO_WORDS}
              </span>
            </div>
            <textarea
              id="shop-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers what your shop is about"
              disabled={isSaving}
              className={`${INPUT} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="shop-hours" className={LABEL}>
              Opening Hours
            </label>
            <input
              id="shop-hours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Mon - Fri 9 am to 10 pm"
              disabled={isSaving}
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="shop-address" className={LABEL}>
              Shop Address
            </label>
            <input
              id="shop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city"
              disabled={isSaving}
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="shop-website" className={LABEL}>
              Website
            </label>
            <input
              id="shop-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
              disabled={isSaving}
              className={INPUT}
            />
          </div>

          {/* Social links */}
          <div>
            <span className={LABEL}>Social Links</span>

            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    aria-label="Social platform"
                    value={link.type}
                    onChange={(e) =>
                      updateLink(index, {
                        type: e.target.value as SocialLink["type"],
                      })
                    }
                    disabled={isSaving}
                    className={`${INPUT} w-32 shrink-0 sm:w-36`}
                  >
                    {SOCIAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    aria-label="Social link URL"
                    value={link.url}
                    onChange={(e) => updateLink(index, { url: e.target.value })}
                    placeholder={
                      link.type === "youtube"
                        ? "https://www.youtube.com/@yourchannel"
                        : "https://x.com/yourhandle"
                    }
                    disabled={isSaving}
                    className={`${INPUT} min-w-0 flex-1`}
                  />

                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    disabled={isSaving}
                    aria-label="Remove link"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-600 text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLink}
              disabled={isSaving}
              className="mt-3 flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              <Plus size={14} />
              Add Social Link
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <ButtonLoader size={16} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
