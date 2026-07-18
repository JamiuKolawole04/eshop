"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { GoogleSignInButton } from "@/shared/components/googleButton";

type FormData = {
  email: string;
  password: string;
};

const Page = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/register`,
        data,
        { withCredentials: true },
      );

      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push("/");
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";

      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1] font-Poppins">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-Poppins font-semibold text-center mb-2">
            Login to Eshop
          </h3>

          <p className="text-center text-gray-500 mb-4">
            Don't have an account?
            <Link href="/signup" className="text-blue-500 ml-2">
              Sign up
            </Link>
          </p>

          <GoogleSignInButton />

          <div className="flex items-center my-5 text-gray-400 text-sm font-Poppins">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3">or sign in with Email</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="support@doe.com"
              className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {String(errors.email.message)}
              </p>
            )}

            <label htmlFor="email" className="block text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="support@doe.com"
                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                {...register("password", {
                  required: "Passowrd is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {isPasswordVisible ? <Eye /> : <EyeOff />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center my-4">
              <label htmlFor="" className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>

              <Link href="/forgot-password" className="text-blue-500 text-sm">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-base cursor-pointer bg-black text-white py-2 rounded-lg"
            >
              {loginMutation.isPending ? "Loggin in ..." : "Login"}
            </button>

            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
