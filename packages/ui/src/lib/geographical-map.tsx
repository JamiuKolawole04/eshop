"use client";

import { useState, useEffect } from "react";
import {
  ComposableMap,
  createCoordinates,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

import { ButtonLoader } from "./button-loader";

type GeoTopology = {
  type: string;
  objects: Record<string, unknown>;
  arcs: number[][][];
};

export type CountryStat = {
  name: string;
  users: number;
  sellers?: number;
};

type Prop = {
  data?: CountryStat[];
};

const countryData: CountryStat[] = [
  { name: "United States of America", users: 120, sellers: 30 },
  { name: "India", users: 100, sellers: 20 },
  { name: "United Kingdom", users: 85, sellers: 15 },
  { name: "Germany", users: 70, sellers: 10 },
  { name: "Canada", users: 60, sellers: 5 },
];

const COUNTRY_ALIASES: Record<string, string> = {
  "united states": "United States of America",
  "ivory coast": "Côte d'Ivoire",
  "democratic republic of the congo": "Dem. Rep. Congo",
  "republic of the congo": "Congo",
};

const normalizeCountry = (name: string) =>
  (COUNTRY_ALIASES[name.toLowerCase()] ?? name).toLowerCase();

export const GeographicalMap = ({ data }: Prop) => {
  const stats = data ?? countryData;
  const max = stats.reduce(
    (highest, country) =>
      Math.max(highest, country.users + (country.sellers ?? 0)),
    0,
  );

  const findStat = (countryName: string) =>
    stats.find(
      (country) =>
        normalizeCountry(country.name) === normalizeCountry(countryName),
    );

  const getColor = (stat?: CountryStat) => {
    const total = (stat?.users ?? 0) + (stat?.sellers ?? 0);
    if (total <= 0) return "#1e293b";
    return total >= max / 2 ? "#22c55e" : "#3b82f6";
  };

  const hasSellers = stats.some((country) => country.sellers !== undefined);

  const [geoData, setGeoData] = useState<GeoTopology | null>(null);
  const [hovered, setHovered] = useState<{
    name: string;
    users: number;
    sellers?: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/api/geo/countries")
      .then((res) => res.json())
      .then((data) => setGeoData(data as GeoTopology))
      .catch((err) => console.error("Failed to load geo data:", err));
  }, []);

  if (!geoData) {
    return (
      <div className="relative w-full px-0 py-5 h-[35vh] flex items-center justify-center text-gray-400 text-sm">
        <ButtonLoader />
      </div>
    );
  }

  return (
    <div className="relative w-full px-0 py-5 overflow-visible">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 230, center: createCoordinates(0, 10) }}
        width={1400}
        height={500}
        viewBox="0 0 1400 500"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "35vh",
          background: "transparent",
          margin: 0,
          padding: 0,
          display: "block",
        }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const match = findStat(countryName);
              const baseColor = getColor(match);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) => {
                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                    setHovered({
                      name: countryName,
                      users: match?.users || 0,
                      sellers: match?.sellers,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  fill={baseColor}
                  stroke="#334155"
                  style={{
                    default: {
                      outline: "none",
                      transition: "fill 0.3s ease-in-out",
                    },
                    hover: {
                      fill: match ? baseColor : "#facc15",
                      outline: "none",
                      transition: "fill 0.3s ease-in-out",
                    },
                    pressed: { fill: "#ef4444", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed bg-gray-800 text-white text-xs p-2 !rounded shadow-lg pointer-events-none"
            style={{
              top: tooltipPosition.y,
              left: tooltipPosition.x,
            }}
          >
            <strong>{hovered.name}</strong>
            <br />
            Users: <span className="text-green-400">{hovered.users}</span>
            {hasSellers && (
              <>
                <br />
                Sellers:{" "}
                <span className="text-yellow-400">{hovered.sellers ?? 0}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
