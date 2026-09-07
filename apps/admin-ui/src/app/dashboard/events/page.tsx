/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { GetEventOffersResponseType } from "@packages/ui";

const EventsPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page] = useState(1);

  const limit = 10;

  const fetchEvents = async () => {
    const response = await axiosInstance.get<GetEventOffersResponseType>(
      `/api/admin/events?page=${page}&limit=${limit}`,
    );

    return response.data.events;
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0].url}
            alt={row.original.images[0].url}
            width={200}
            height={200}
            className="w-12 h-12 rounded-md object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "starting_date",
        header: "Start",
        cell: ({ row }: any) =>
          new Date(row.original.starting_date).toLocaleDateString(),
      },
      {
        accessorKey: "endiing_date",
        header: "End",
        cell: ({ row }: any) =>
          new Date(row.original.ending_date).toLocaleDateString(),
      },

      {
        accessorKey: "shop.name",
        header: "Shop Name",
        cell: ({ row }: any) => row.original?.shop?.name || "-",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8 font-Poppins text-sm">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Events</h2>
        <Link
          href="/dashboard/create-event"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Event
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Events</span>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search events..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading events...</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white text-base font-medium">No events found</p>
            <p className="text-gray-400 text-sm mt-1">
              You haven&apos;t created any events yet. Click &quot;Add
              Event&quot; to get started.
            </p>
          </div>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
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
      </div>
    </div>
  );
};

export default EventsPage;
