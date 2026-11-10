import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | eshop",
  description:
    "How eshop collects, uses and shares your information, and the choices you have.",
};

const Page = () => {
  return (
    <div className="w-full bg-white font-Poppins">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen pb-16 md:pb-24">
        <div className="pb-6 md:pb-[50px]">
          <h1 className="pt-6 md:pt-[50px] font-medium text-3xl md:text-[44px] leading-[1] mb-4">
            Privacy Policy
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>

          <span className="text-[#55585b]">Privacy Policy</span>
        </div>

        <article className="max-w-[68ch]">
          <p className="text-xs md:text-sm text-gray-500">
            Last updated: 5 November 2026
          </p>

          <p className="mt-6 text-[15px] md:text-base leading-7 text-gray-700">
            eshop is an online marketplace that connects buyers with independent
            sellers in Nigeria. This policy explains what information we
            collect, why we collect it, and the choices you have.
          </p>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Information we collect
            </h2>
            <ul className="mt-3 pl-5 space-y-2 list-disc marker:text-gray-400 text-[15px] md:text-base leading-7 text-gray-700">
              <li>
                <span className="font-medium text-gray-900">Account details:</span>{" "}
                your name, email address and password.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Order and delivery details:
                </span>{" "}
                the items you order, your delivery address and landmark, and
                your order history.
              </li>
              <li>
                <span className="font-medium text-gray-900">Seller details:</span>{" "}
                your shop information and the bank account details used for
                payouts.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Usage information:
                </span>{" "}
                your device, browser, approximate location and the pages you
                visit.
              </li>
              <li>
                <span className="font-medium text-gray-900">
                  Payment information:
                </span>{" "}
                payments are processed securely and we do not store your card
                details.
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              How we use your information
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              We use your information to create and manage your account, process
              and deliver orders, pay sellers, prevent fraud, provide support,
              and improve eshop. We may also send you order updates and, where
              you have agreed, occasional service messages.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Sharing your information
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Sellers receive the order and delivery details they need to fulfil
              your order. We also share information with our payment provider
              and with hosting and analytics providers. We do not sell your
              personal information. We may disclose information where required
              by law.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Cookies
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              We use cookies to keep you signed in, remember your cart and
              preferences, and understand how the site is used.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Security and retention
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              We take reasonable steps to protect your information and keep it
              only for as long as your account is active or as required by law.
              No system is completely secure.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Your rights
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              You may request access to, correction of, or deletion of your
              personal information, or withdraw your consent, by contacting us
              at{" "}
              <a
                href="mailto:eshopstore.support@gmail.com"
                className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
              >
                eshopstore.support@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Children
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              eshop is not intended for people under 18.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Changes
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              We may update this policy from time to time. The latest version
              will always be on this page.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Contact
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Questions about this policy? Email{" "}
              <a
                href="mailto:eshopstore.support@gmail.com"
                className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
              >
                eshopstore.support@gmail.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default Page;
