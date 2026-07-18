"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { GoogleSignInButton } from "@/shared/components/googleButton";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const Page = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/register`,
        data,
      );

      return response.data;
    },

    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/verify`,
        { ...userData, otp: otp.join("") },
      );

      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1] font-Poppins">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Signup
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-Poppins font-semibold text-center mb-2">
            Signup to Eshop
          </h3>

          <p className="text-center text-gray-500 mb-4">
            Already have an account?
            <Link href="/login" className="text-blue-500 ml-2">
              Login
            </Link>
          </p>

          <GoogleSignInButton />

          <div className="flex items-center my-5 text-gray-400 text-sm font-Poppins">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3">or sign in with Email</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Jon Snow"
                className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {String(errors.name.message)}
                </p>
              )}

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
                  placeholder="**********"
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

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-base cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
              >
                {signupMutation.isPending ? "Signing up ..." : "Sign up"}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>

              <div className="flex justify-center gap-6">
                {otp.map((digit, index) => (
                  <input
                    key={index + 1}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-500 outline-none !rounded"
                    value={digit}
                    onChange={({ target: { value } }) =>
                      handleOtpChange(index, value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>

              <button
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? "Verifying ..." : "Verify OTP"}
              </button>

              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    className="text-blue-500 cursor-pointer"
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>

              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
