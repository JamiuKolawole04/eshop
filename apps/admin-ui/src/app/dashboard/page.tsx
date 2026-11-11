"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import {
  AdminDeviceUsageResponseType,
  AdminGeoStatsResponseType,
  AdminOrdersResponseType,
  AdminPageViewsResponseType,
  AdminRevenueData,
  ButtonLoader,
  DeviceStat,
  GeographicalMap,
  OrderWithShop,
  SalesChart,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";

const fetchOrders = async () => {
  const response = await axiosInstance.get<AdminOrdersResponseType>(
    `/api/orders/admin/all`,
  );

  return response.data.orders;
};

const fetchAdminRevenue = async () => {
  const response = await axiosInstance.get<AdminRevenueData>(
    `/api/orders/admin/revenue`,
  );

  return response.data.revenueData;
};

const fetchAdminDeviceUsage = async () => {
  const response = await axiosInstance.get<AdminDeviceUsageResponseType>(
    `/api/admin/device-usage`,
  );

  return response.data.deviceUsage;
};

const fetchAdminGeo = async () => {
  const response =
    await axiosInstance.get<AdminGeoStatsResponseType>(`/api/admin/geo`);

  return response.data.data;
};

const fetchAdminPageViews = async () => {
  const response = await axiosInstance.get<AdminPageViewsResponseType>(
    `/api/admin/page-views`,
  );

  return response.data;
};

const OrdersTable = () => {
  const { data: orders = [], isLoading } = useQuery<OrderWithShop[]>({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo<ColumnDef<OrderWithShop>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => (
          <span className="text-white text-sm truncate">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
      },
      {
        accessorKey: "total",
        header: "Amount",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<OrderWithShop["status"]>();
          const color =
            value === "Paid"
              ? "text-green-400"
              : value === "Pending"
                ? "text-yellow-400"
                : "text-red-400";
          return <span className={`font-medium ${color}`}>{value}</span>;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6">
      <h2 className="text-white text-lg sm:text-xl font-semibold mb-4">
        Recent Orders
        <span className="block text-sm text-slate-400 font-normal">
          A quick snapshot of your latest transactions.
        </span>
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <ButtonLoader className="text-white mt-5" />
        </div>
      ) : (
        <div className="!rounded-xl shadow-xl overflow-x-auto border border-slate-700">
          <table className="min-w-full text-xs sm:text-sm text-white">
            <thead className="bg-slate-900 text-slate-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 sm:p-3 text-left whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-transparent">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-600 hover:bg-slate-800 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 sm:p-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ADMIN_TIME_ZONE = "Africa/Lagos";

const lagosDayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Decorative sparkline geometry. Empty, single-point and flat series all fall
// back to a straight baseline instead of breaking the path.
const buildSparklinePoints = (values: number[], width = 100, height = 28) => {
  const mid = height / 2;
  const baseline = `0,${mid} ${width},${mid}`;

  if (values.length < 2) return baseline;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  if (range === 0) return baseline;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 2 - ((value - min) / range) * (height - 4);

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

const formatLastVisit = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: ADMIN_TIME_ZONE,
    day: "numeric",
    month: "short",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: ADMIN_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return `${day}, ${time}`;
};

const Sparkline = ({ points }: { points: string }) => (
  <svg
    viewBox="0 0 100 28"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="h-7 w-full text-slate-500"
  >
    <polyline
      points={points}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const StripStat = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) => (
  <div className="bg-slate-900/60 px-4 py-3.5 sm:px-5 sm:py-4">
    <p className="text-xs text-slate-400">{label}</p>
    <div className="mt-1.5">
      <p className="text-xl font-semibold leading-none text-white tabular-nums sm:text-2xl">
        {value}
      </p>
      {detail ? <div className="mt-2">{detail}</div> : null}
    </div>
  </div>
);

const PageViewsStrip = () => {
  const { data, isLoading } = useQuery<AdminPageViewsResponseType>({
    queryKey: ["admin-page-views"],
    queryFn: fetchAdminPageViews,
    staleTime: 1000 * 60 * 5,
  });

  const { viewsToday, visitorsToday, totalViews, sparklinePoints } =
    useMemo(() => {
      const days = data?.days ?? [];
      const today = days.find((day) => day.date === lagosDayKey());
      const values = days.map((day) => day.views);

      return {
        viewsToday: today?.views ?? 0,
        visitorsToday: today?.visitors ?? 0,
        totalViews: values.reduce((sum, views) => sum + views, 0),
        sparklinePoints: buildSparklinePoints(values),
      };
    }, [data]);

  const lastVisit = formatLastVisit(data?.lastVisit ?? null);
  const hasTraffic = totalViews > 0;

  return (
    <section
      aria-label="Landing page traffic"
      className="relative mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl lg:mb-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pt-3.5 pb-3 sm:px-5">
        <h2 className="text-sm font-semibold text-white">
          Landing page traffic
        </h2>
        <span className="text-xs text-slate-400">
          Last 7 days &middot; Africa/Lagos
        </span>
      </div>

      {isLoading ? (
        <div className="flex min-h-[104px] items-center justify-center border-t border-slate-800/80">
          <ButtonLoader className="text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px border-t border-slate-800/80 bg-slate-800/70 lg:grid-cols-4">
          <StripStat
            label="Views today"
            value={viewsToday.toLocaleString("en-US")}
          />
          <StripStat
            label="Visitors today"
            value={visitorsToday.toLocaleString("en-US")}
          />
          <StripStat
            label="Views · 7 days"
            value={totalViews.toLocaleString("en-US")}
            detail={
              hasTraffic ? (
                <Sparkline points={sparklinePoints} />
              ) : (
                <p className="text-xs text-slate-500">
                  No landing page traffic yet.
                </p>
              )
            }
          />
          <StripStat label="Last visit" value={lastVisit} />
        </div>
      )}
    </section>
  );
};

// Dashboard Layout
const DashboardPage = () => {
  const { data: revenueData = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: fetchAdminRevenue,
    staleTime: 1000 * 60 * 5,
  });

  const { data: deviceData = [], isLoading: isDeviceLoading } = useQuery({
    queryKey: ["admin-device-usage"],
    queryFn: fetchAdminDeviceUsage,
    staleTime: 1000 * 60 * 5,
  });

  const { data: geoData = [], isLoading: isGeoLoading } = useQuery({
    queryKey: ["admin-geo"],
    queryFn: fetchAdminGeo,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-poppins">
      <PageViewsStrip />

      {/* Top Charts */}
      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="w-full lg:w-[65%]">
          <div className="rounded-2xl shadow-xl">
            <h2 className="text-white text-lg sm:text-xl font-semibold">
              Revenue
              <span className="block text-sm text-slate-400 font-normal">
                Last 6 months performance
              </span>
            </h2>
            {isRevenueLoading ? (
              <div className="flex items-center justify-center">
                <ButtonLoader className="text-white mt-5" />
              </div>
            ) : (
              <SalesChart revenueData={revenueData} />
            )}
          </div>
        </div>

        {/* Device Usage */}
        <div className="w-full lg:w-[35%] rounded-2xl shadow-xl">
          <h2 className="text-white text-lg sm:text-xl font-semibold mb-2">
            Device Usage
            <span className="block text-sm text-slate-400 font-normal">
              How users access your platform
            </span>
          </h2>
          {isDeviceLoading ? (
            <div className="flex items-center justify-center">
              <ButtonLoader className="text-white mt-5" />
            </div>
          ) : (
            <div className="mt-6 sm:mt-10 lg:mt-14">
              <DeviceStat deviceData={deviceData} />
            </div>
          )}
        </div>
      </div>

      {/* Geo Map + Orders */}
      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8 mt-8">
        {/* Map */}
        <div className="w-full lg:w-[60%]">
          <h2 className="text-white text-lg sm:text-xl font-semibold mt-6 lg:mt-6">
            User &amp; Seller Distribution
            <span className="block text-sm text-slate-400 font-normal">
              Visual breakdown of global user &amp; seller activity.
            </span>
          </h2>
          {isGeoLoading ? (
            <div className="flex items-center justify-center h-[35vh]">
              <ButtonLoader className="text-white mt-5" />
            </div>
          ) : (
            <GeographicalMap data={geoData} />
          )}
        </div>

        {/* Orders Table */}
        <div className="w-full lg:w-[40%]">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
