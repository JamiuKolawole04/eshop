import { Poppins, Roboto, Oregano } from "next/font/google";
import { Metadata } from "next";

import Providers from "@/shared/context/providers";
import Header from "@/shared/widgets/header";
import "./global.css";

export const metadata: Metadata = {
  title: "Welcome to user-ui",
  description: "Eshop",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

const oregano = Oregano({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-oregano",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased ${roboto.variable} ${poppins.variable} ${oregano.variable}`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
