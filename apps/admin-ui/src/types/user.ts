export type UserRole = "admin" | "user" | "seller";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  banned: boolean;
};

type Admin = User;

export type AdminsResponseType = {
  success: true;
  admins: Array<Admin>;
};

export type UsersResponseType = {
  data: User[];
  meta: {
    totalUsers: number;
    currentPage: number;
    totalPages: number;
  };
};

export type UpdateRoleToAdminResponseType = {
  name: string;
  id: string;
  email: string;
  role: string;
};
