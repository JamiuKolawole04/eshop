"use client";

import Link from "next/link";
import { ArrowUp, MapPin, Mail, X } from "lucide-react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";

const myAccountLinks = [
  { label: "Track Orders", href: "/track-orders" },
  { label: "Shipping", href: "/shipping" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "My Account", href: "/profile" },
  { label: "Order History", href: "/orders" },
  { label: "Returns", href: "/returns" },
];

const informationLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Latest News", href: "/news" },
  { label: "Contact Us", href: "/contact" },
];

const socials = [
  { label: "Facebook", href: "#", Icon: FaFacebook },
  { label: "Twitter", href: "#", Icon: X },
  { label: "LinkedIn", href: "#", Icon: FaLinkedin },
];

const LinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div>
    <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="inline-block py-0.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-gray-200 bg-white font-Poppins">
      {/* Mobile: 2 cols (brand + contact span full width)
          Desktop (lg): 4 cols in one row */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-8 sm:gap-x-10 sm:gap-y-10 sm:px-6 sm:py-12 lg:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1">
          <p className="max-w-xs text-sm text-gray-600 lg:max-w-[220px]">
            Perfect ecommerce platform to start your business from scratch
          </p>
          <div className="mt-4 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:h-8 lg:w-8"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <LinkColumn title="My Account" links={myAccountLinks} />
        <LinkColumn title="Information" links={informationLinks} />

        {/* Contact */}
        <div className="col-span-2 lg:col-span-1">
          <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4">
            Talk To Us
          </h3>
          <p className="text-xs text-gray-500">Got Questions? Call us</p>
          <a
            href="tel:+67041390762"
            className="mt-1 block text-lg font-bold text-gray-900 sm:text-xl"
          >
            +670 413 90 762
          </a>

          <a
            href="mailto:support@eshop.com"
            className="mt-4 flex items-center gap-2 break-all text-sm text-gray-600 hover:text-gray-900"
          >
            <Mail size={14} className="shrink-0" />
            support@eshop.com
          </a>

          <p className="mt-2 flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>
              79 Sleepy Hollow St.
              <br />
              Jamaica, New York 1432
            </span>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} All Rights Reserved | Becodemy Private
            Ltd
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};
