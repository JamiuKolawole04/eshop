"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { Fragment, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { SiStripe } from "react-icons/si";

import { countries } from "@/utils/countries";
import { CreateShop } from "@/shared/modules/auth/create-shop";

type FormData = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
};

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState("");

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
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/sellers/register`,
        data,
      );

      return response.data;
    },

    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/sellers/verify`,
        { ...sellerData, otp: otp.join("") },
      );

      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
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
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}`,
        { sellerId },
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.log("Stripe connection error.", err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen font-Poppins">
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />

        {[1, 2, 3].map((step, index) => (
          <div key={index + 1}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-blue-500" : "bg-gray-300"}`}
            >
              {step}
            </div>

            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                  ? "Setup shop"
                  : "Connect bank"}
            </span>
          </div>
        ))}
      </div>

      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <Fragment>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-3xl font-Poppins font-semibold text-center mb-2">
                  Create Account
                </h3>

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

                <label htmlFor="phone" className="block text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="880178583****"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("phone_number", {
                    required: "Phone Number is required",
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: "Invalid phone number format",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits.",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone number cannot exceed 15 digits.",
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                <label htmlFor="country" className="block text-gray-700 mb-1">
                  Country
                </label>

                <select
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("country", { required: "Country is required" })}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {String(errors.country.message)}
                  </p>
                )}

                <label htmlFor="password" className="block text-gray-700 mb-1">
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

                {signupMutation?.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                <p className="text-center text-gray-500 mb-4 mt-2">
                  Already have an account?
                  <Link href="/login" className="text-blue-500 ml-2">
                    Login
                  </Link>
                </p>
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
          </Fragment>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw method</h3>

            <br />

            <button
              className="w-full m-auto flex items-center justify-center gap-3 text-base bg-[#334155] text-white py-2 rounded-lg"
              onClick={connectStripe}
            >
              Connect stripe
              <SiStripe
                className="bg-[#635bff] text-white rounded p-0.5"
                size={17}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
