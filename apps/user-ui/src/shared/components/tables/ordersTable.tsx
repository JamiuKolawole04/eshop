/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  formatCurrency,
  OrderWithItems,
  UserOrdersResponseType,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";

const fetchUserOrders = async () => {
  const res =
    await axiosInstance.get<UserOrdersResponseType>(`/api/orders/user`);
  return res.data.orders;
};

export const OrdersTable = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: fetchUserOrders,
  });

  const columns: ColumnDef<OrderWithItems>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: (info: any) => info.getValue()?.slice(-6),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (info: any) => formatCurrency(info.getValue()),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (info: any) => new Date(info.getValue())?.toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/order/${row.original.id}`)}
          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
        >
          Track Order <ArrowUpRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  const table = useReactTable<OrderWithItems>({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return <p className="text-sm text-gray-600">Loading orders...</p>;

  if ((data?.length ?? 0) === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShoppingBag size={22} />
        </div>
        <p className="font-medium text-gray-800">No orders yet</p>
        <p className="text-sm text-gray-500">
          When you place an order, it will appear here.
        </p>
        <Link
          href="/products"
          className="mt-5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Start shopping
        </Link>
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-b-gray-200 text-left"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-2 px-3 font-semibold text-gray-700"
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-b-gray-200 hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2 px-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
