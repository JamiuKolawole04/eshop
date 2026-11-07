/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "node:path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  // service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const renderTemplate = (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`,
  );
  return ejs.renderFile(templatePath, data);
};

export const sendMail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
) => {
  try {
    const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;

    if (!fromAddress) {
      throw new Error("SMTP_FROM or SMTP_USER must be set");
    }

    const html = await renderTemplate(templateName, data);
    await transporter.sendMail({
      from: {
        name: "Eshop",
        address: fromAddress,
      },
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
