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
  ButtonLoader,
  DeviceStat,
  GeographicalMap,
  Order,
  SalesChart,
  SellerDeviceUsageResponseType,
  SellerGeoStatsResponseType,
  SellerOrdersResponseType,
  SellerRevenueData,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";

const fetchOrders = async () => {
  const response =
    await axiosInstance.get<SellerOrdersResponseType>(`/api/orders/seller`);

  return response.data.orders;
};

const fetchDeviceUsage = async () => {
  const response = await axiosInstance.get<SellerDeviceUsageResponseType>(
    `/api/sellers/device-usage`,
  );

  return response.data.deviceUsage;
};

const fetchSellerRevenue = async () => {
  const response = await axiosInstance.get<SellerRevenueData>(
    `/api/orders/seller/revenue`,
  );

  return response.data.revenueData;
};

const fetchGeoStats = async () => {
  const response = await axiosInstance.get<SellerGeoStatsResponseType>(
    `/api/sellers/geo/stats`,
  );

  return response.data.data;
};

const OrdersTable = () => {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo<ColumnDef<Order>[]>(
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
        cell: ({ row }) => <span>${row.original.total}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue<Order["status"]>();
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

// Dashboard Layout
const DashboardPage = () => {
  const { data: deviceData = [], isLoading: isDeviceDataLoading } = useQuery({
    queryKey: ["seller-device-usage"],
    queryFn: fetchDeviceUsage,
    staleTime: 1000 * 60 * 5,
  });

  const { data, isLoading: isRevenueDataLoading } = useQuery({
    queryKey: ["seller-revenue"],
    queryFn: fetchSellerRevenue,
    staleTime: 1000 * 60 * 5,
  });

  const { data: geoData = [], isLoading: isGeoDataLoading } = useQuery({
    queryKey: ["seller-geo-stats"],
    queryFn: fetchGeoStats,
    staleTime: 1000 * 60 * 5,
  });
  return (
    <div className="p-4 sm:p-6 lg:p-8 font-Poppins">
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

            {isRevenueDataLoading ? (
              <div className="flex items-center justify-center">
                <ButtonLoader className="text-white mt-5" />
              </div>
            ) : (
              <SalesChart revenueData={data} />
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
          {isDeviceDataLoading ? (
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
            Where your visitors come from
            <span className="block text-sm text-slate-400 font-normal">
              Visual breakdown of user activity.
            </span>
          </h2>
          {isGeoDataLoading ? (
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
