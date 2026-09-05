"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { ButtonLoader, Input } from "@packages/ui";

type FormData = {
  email: string;
  password: string;
};

export const Page = () => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/admin/login`,
        data,
        { withCredentials: true },
      );

      return response.data;
    },

    onSuccess: () => {
      setServerError(null);
      router.push("/dashboard");
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
    <div className="w-full h-screen flex items-center justify-center">
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md sshadow">
        <form className="p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-poppins">
            Welcome Admin
          </h1>

          <Input
            label="Email"
            placeholder="support@becodemy.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">
              {String(errors.email.message)}
            </p>
          )}

          <div className="mt-3">
            <Input
              label="Password"
              type="password"
              placeholder="******"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <button
            disabled={loginMutation.isPending}
            type="submit"
            className="w-full mt-5 text-base flex items-center justify-center gap-2 font-semibold font-poppins cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <Fragment>
                <ButtonLoader size={18} className="text-white" />
                Logging in...
              </Fragment>
            ) : (
              "Login"
            )}
          </button>
          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
