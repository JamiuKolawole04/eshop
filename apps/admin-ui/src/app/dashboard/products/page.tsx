"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { ChevronRight, Eye, Search, Star } from "lucide-react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { ButtonLoader } from "@packages/ui";
import { Pagination } from "@/shared/components/pagination";
import { ProductForAdmin, ProductsForAdminResponseType } from "@/types/product";

const Products = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);

  const limmit = 10;

  const fetchProducts = async () => {
    const response = await axiosInstance.get<ProductsForAdminResponseType>(
      `/api/admin/products?page=${page}&limit=${limmit}`,
    );

    return response?.data;
  };

  const {
    data: products,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["all-products", page],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<ProductForAdmin>[]>(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => (
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
        cell: ({ row }) => {
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
        cell: ({ row }) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
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
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: products?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 font-poppins">
        <ButtonLoader size={28} className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-8 font-Poppins text-sm">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Products</span>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {products?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white text-base font-medium">
              No products found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              You haven&apos;t created any products yet. Click &quot;Add
              Product&quot; to get started.
            </p>
          </div>
        ) : (
          <Fragment>
            <table
              className={`w-full text-white transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
            >
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

            <Pagination
              currentPage={products?.meta?.currentPage || 1}
              totalPages={products?.meta?.totalPages || 1}
              onPageChange={setPage}
            />
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Products;
