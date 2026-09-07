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
import { Search, Ban, UserCheck, AlertTriangle } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

import { ButtonLoader } from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { BreadCrumbs } from "@/shared/components/breadcrumbs";
import { Pagination } from "@/shared/components/pagination";
import { User, UsersResponseType } from "@/types/user";

const UsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const limit = 10;

  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<UsersResponseType, Error> =
    useQuery<UsersResponseType, Error, UsersResponseType, [string, number]>({
      queryKey: ["users-list", page],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/api/admin/users?page=${page}&limit=${limit}`,
        );
        return res.data;
      },
      placeholderData: (previousData) => previousData,
      staleTime: 1000 * 60 * 5,
    });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/api/admin/ban-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allUsers = data?.data || [];

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesRole = roleFilter
        ? user.role.toLowerCase() === roleFilter.toLowerCase()
        : true;

      const matchesGlobal = deferredGlobalFilter
        ? Object.values(user)
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;

      return matchesRole && matchesGlobal;
    });
  }, [allUsers, roleFilter, deferredGlobalFilter]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="uppercase font-semibold text-blue-400">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user: User = row.original;
          return (
            <button
              onClick={() => {
                if (user.banned) {
                  banUserMutation.mutate(user.id);
                  return;
                }
                setSelectedUser(user);
                setIsModalOpen(true);
              }}
              className={`p-2 rounded-md ${
                user.banned
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-red-500 hover:bg-red-950"
              }`}
              aria-label={user.banned ? "Unban user" : "Ban user"}
            >
              {user.banned ? <UserCheck size={16} /> : <Ban size={16} />}
            </button>
          );
        },
      },
    ],
    [banUserMutation],
  );

  const table = useReactTable({
    data: filteredUsers,
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
        <h2 className="text-xl font-bold tracking-wide">All Users</h2>
        <select
          className="bg-gray-900 border border-gray-700 outline-none text-white rounded-md px-3 py-1.5"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="mb-4">
        <BreadCrumbs title="All Users" />
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
        {filteredUsers.length === 0 ? (
          <p className="text-center py-6 text-gray-400">No users found.</p>
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

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-[380px]">
            <h3 className="text-lg font-semibold mb-2">Ban User</h3>
            <p className="text-sm text-gray-300 mb-6 flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-yellow-400 shrink-0 mt-0.5"
              />
              <span>
                <span className="text-yellow-400 font-medium">Important:</span>{" "}
                Are you sure you want to ban{" "}
                <span className="text-red-400">{selectedUser.name}</span> ? This
                action can be reverted later.
              </span>
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-2 py-1.5 rounded-md bg-gray-700 text-sm hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => banUserMutation.mutate(selectedUser.id)}
                className="px-2 py-1.5 rounded-md bg-red-600 flex items-center gap-1.5 text-sm hover:bg-red-700"
              >
                <Ban size={12} />
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
