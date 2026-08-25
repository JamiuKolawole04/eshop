"use client";

import { useState, useRef, MouseEvent } from "react";

type ImageMagnifierProps = {
  src: string;
  alt?: string;
  zoom?: number;
};

export default function ImageMagnifier({
  src,
  alt = "Product Image",
  zoom = 2,
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const posX = ((e.clientX - rect.left) / rect.width) * 100;
    const posY = ((e.clientY - rect.top) / rect.height) * 100;
    setXY([posX, posY]);
  };

  return (
    <div className="relative w-full flex gap-4">
      <div
        ref={containerRef}
        className="relative w-full aspect-square overflow-hidden"
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>

      {showMagnifier && (
        <div
          className="hidden md:block absolute top-0 left-full ml-4 w-[400px] h-[400px] border border-gray-200 rounded-md overflow-hidden pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoom * 100}%`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
}
