"use client";

import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { ButtonLoader } from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { BreadCrumbs } from "@/shared/components/breadcrumbs";
import { Pagination } from "@/shared/components/pagination";
import { Seller, SellersResponseType } from "@/types/seller";
import Image from "next/image";

const SellersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const limit = 10;

  const { data, isLoading }: UseQueryResult<SellersResponseType, Error> =
    useQuery<SellersResponseType, Error, SellersResponseType, [string, number]>(
      {
        queryKey: ["sellers-list", page],
        queryFn: async () => {
          const res = await axiosInstance.get(
            `/api/admin/sellers?page=${page}&limit=${limit}`,
          );
          return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5,
      },
    );

  const allSellers = data?.data || [];

  const filteredSellers = useMemo(() => {
    return allSellers.filter((seller) => {
      const matchesGlobal = deferredGlobalFilter
        ? Object.values(seller)
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;

      return matchesGlobal;
    });
  }, [allSellers, deferredGlobalFilter]);

  const columns = useMemo<ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: "shop.avatar",
        header: "Avatar",
        cell: ({ row }) => (
          <Image
            src={row.original.shop?.avatar}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }) => {
          const shopName = row.original.shop?.name;
          return shopName ? (
            <a
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {shopName}
            </a>
          ) : (
            <span className="text-gray-400 italic">No Shop</span>
          );
        },
      },
      {
        accessorKey: "shop.address",
        header: "Address",
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    [],
  );
  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 font-poppins">
        <ButtonLoader size={28} className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 text-white font-poppins">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wide">All Sellers</h2>
      </div>

      <div className="mb-4">
        <BreadCrumbs title="All Sellers" />
      </div>

      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {filteredSellers.length === 0 ? (
          <p className="text-center py-6 text-gray-400">No sellers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-2 px-2 text-gray-400 font-medium"
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
                <tr key={row.id} className="border-b border-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-2">
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
        )}

        <Pagination
          currentPage={data?.meta?.currentPage || 1}
          totalPages={data?.meta?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default SellersPage;
