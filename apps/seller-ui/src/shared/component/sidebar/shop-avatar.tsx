"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { DashbaordLogo } from "@/assets/svgs/dashbaord/dashboardLogo";

type Props = {
  src?: string | null;
  alt: string;
  size: number;
  isLoading?: boolean;
};

export const ShopAvatar = ({ src, alt, size, isLoading = false }: Props) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const dimensions = { width: size, height: size };

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="shrink-0 animate-pulse rounded-full bg-slate-800"
        style={dimensions}
      />
    );
  }

  if (!src || hasError) {
    return <DashbaordLogo className="shrink-0" style={dimensions} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className="shrink-0 rounded-full object-cover ring-1 ring-slate-700"
      style={dimensions}
    />
  );
};
