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
