"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Fragment, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

const Page = () => {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/forgot-password`,
        { email },
        { withCredentials: true },
      );

      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP. Try again.";

      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/verify-forgot-password`,
        {
          email: userEmail,
          otp: otp.join(""),
        },
      );

      return response.data;
    },

    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP. Try again.";

      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/users/reset-password`,
        {
          email: userEmail,
          newPassword: password,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      setStep("reset");
      toast.success(
        "Password reset successfully. Please login with your new password",
      );

      setServerError(null);
      router.push("/login");
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password. Please try again";

      setServerError(errorMessage);
    },
  });

  const onSubmitMail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1] font-Poppins">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === "email" && (
            <Fragment>
              <h3 className="text-3xl font-Poppins font-semibold text-center mb-2">
                Login to Eshop
              </h3>

              <p className="text-center text-gray-500 mb-4">
                Go back to
                <Link href="/login" className="text-blue-500 ml-2">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitMail)}>
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full mt-4 text-base cursor-pointer bg-black text-white py-2 rounded-lg"
                >
                  {requestOtpMutation.isPending ? "Sending OTP ..." : "Submit"}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </Fragment>
          )}

          {step === "otp" && (
            <Fragment>
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
                    onClick={() =>
                      requestOtpMutation.mutate({ email: userEmail })
                    }
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </Fragment>
          )}

          {step === "reset" && (
            <Fragment>
              <h3 className="text-xl font-semibold text-center mb-4">
                Reset Password
              </h3>

              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
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
              </form>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
