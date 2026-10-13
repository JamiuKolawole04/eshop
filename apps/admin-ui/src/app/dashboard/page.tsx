"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

type Order = {
  id: string;
  customer: string;
  amount: string;
  status: string;
};

import { DeviceStat, GeographicalMap, SalesChart } from "@packages/ui";

const deviceData = [
  { name: "Phone", value: 55 },
  { name: "Tablet", value: 20 },
  { name: "Computer", value: 25 },
];

// Orders data
const orders = [
  { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
  { id: "ORD-002", customer: "Jane Smith", amount: "$180", status: "Pending" },
  { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid" },
  { id: "ORD-004", customer: "Bob Lee", amount: "$90", status: "Failed" },
  { id: "ORD-005", customer: "Bob Lee", amount: "$90", status: "Failed" },
  { id: "ORD-006", customer: "Bob Lee", amount: "$90", status: "Failed" },
];

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
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
];

const OrdersTable = () => {
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Dashboard Layout
const DashboardPage = () => {
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
            <SalesChart />
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
          <div className="mt-6 sm:mt-10 lg:mt-14">
            <DeviceStat deviceData={deviceData} />
          </div>
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
          <GeographicalMap />
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
