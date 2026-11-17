import { Poppins, Roboto, Oregano } from "next/font/google";
import type { Metadata, Viewport } from "next";

import Providers from "@/shared/context/providers";
import Header from "@/shared/widgets/header";
import "./global.css";
import { Footer } from "@/shared/components/footer";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE_PATH,
  SITE_ALTERNATE_NAME,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@/shared/constants/site";

const OG_IMAGE = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: "E-Shop — online shopping in Nigeria",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "online shopping Nigeria",
    "buy phones online Nigeria",
    "fashion store Nigeria",
    "electronics Nigeria",
    "online marketplace Nigeria",
    "home essentials Nigeria",
    "E-Shop",
    "Eshop Store",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: SITE_NAME,
    url: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#005DFB",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#005DFB",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#store`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icons/icon-512.png`,
      image: `${SITE_URL}${OG_IMAGE_PATH}`,
      description: DEFAULT_DESCRIPTION,
      areaServed: { "@type": "Country", name: "Nigeria" },
      currenciesAccepted: "NGN",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        availableLanguage: "en",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAME,
      publisher: { "@id": `${SITE_URL}/#store` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");

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
    <html lang="en-NG">
      <body
        className={`font-sans antialiased ${roboto.variable} ${poppins.variable} ${oregano.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
