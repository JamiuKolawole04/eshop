import crypto from "node:crypto";

import { ValidationError } from "@packages/error-handler";
import { sendMail } from "./sendMail";
import { redis } from "@packages/libs/redis";

const emailRegex = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller",
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields!");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = async (email: string) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account locked due to multiple failed attempts! Try again later after 30 minutes.",
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      "Too many OTP requests! Please wait 1 hour before requesting again.",
    );
  }

  if (await redis.get(`otp_cool_down:${email}`)) {
    throw new ValidationError(
      "Please wait 1 minute before requesting a new OTP.",
    );
  }
};

export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = Number.parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // lock for 1 hour

    throw new ValidationError(
      "Too many OTP requests! Please wait 1 hour before requesting again.",
    );
  }

  await redis.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 3600); // track requests for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(100, 9999).toString();

  await sendMail(email, "Verify Your Email", template, { name, otp });

  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cool_down:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (email: string, otp: string) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = Number.parseInt(
    (await redis.get(failedAttemptsKey)) || "0",
  );

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);

      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes!",
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);

    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left`,
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
