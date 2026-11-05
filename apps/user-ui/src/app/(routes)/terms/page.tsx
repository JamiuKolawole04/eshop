import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | eshop",
  description:
    "The terms that apply when you buy and sell on eshop, the marketplace for independent sellers in Nigeria.",
};

const Page = () => {
  return (
    <div className="w-full bg-white font-Poppins">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen pb-16 md:pb-24">
        <div className="pb-6 md:pb-[50px]">
          <h1 className="pt-6 md:pt-[50px] font-medium text-3xl md:text-[44px] leading-[1] mb-4">
            Terms &amp; Conditions
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>

          <span className="text-[#55585b]">Terms &amp; Conditions</span>
        </div>

        <article className="max-w-[68ch]">
          <p className="text-xs md:text-sm text-gray-500">
            Last updated: 5 November 2026
          </p>

          <section className="mt-8 first:mt-0">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Acceptance
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              By using eshop, you agree to these terms. If you do not agree,
              please do not use the platform.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              About eshop
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              eshop is a marketplace that connects buyers with independent
              sellers in Nigeria. Sellers are responsible for their listings,
              prices and the products they sell. The contract of sale is between
              the buyer and the seller.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Accounts
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              You must provide accurate information and keep your password
              secure. You are responsible for activity on your account. We may
              suspend or close accounts that break these terms.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Orders and payments
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Prices are shown in Nigerian Naira. Payments are processed
              securely. An order is confirmed once payment is successful and the
              seller accepts it. If an item is unavailable, we or the seller will
              contact you and any payment taken will be refunded.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Delivery
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Delivery times are estimates. Please provide a complete address,
              including a landmark, so our dispatch riders can find you. Risk in
              the goods passes to you on delivery.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Returns and refunds
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              If an item arrives damaged, faulty or different from what you
              ordered, contact{" "}
              <a
                href="mailto:support@eshop.com"
                className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
              >
                support@eshop.com
              </a>{" "}
              within 48 hours of delivery with your order number and photos.
              Approved refunds are returned to your original payment method.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Seller responsibilities
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Sellers must list accurate products and prices, fulfil orders
              promptly, and comply with Nigerian law. Prohibited or unlawful
              items may not be listed. Payouts are made to the bank account
              provided by the seller.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Acceptable use
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              Do not use eshop to commit fraud, misuse other people&apos;s
              information, or interfere with the platform.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Intellectual property
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              The eshop name, logo and content belong to us or our licensors and
              may not be used without permission.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Limitation of liability
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              To the extent permitted by law, eshop is not liable for indirect
              losses or for the acts of independent sellers.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Governing law
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              These terms are governed by the laws of the Federal Republic of
              Nigeria.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[17px] md:text-xl font-medium tracking-[-0.01em] text-gray-900">
              Changes and contact
            </h2>
            <p className="mt-3 text-[15px] md:text-base leading-7 text-gray-700">
              We may update these terms. The latest version will always be on
              this page. Questions? Email{" "}
              <a
                href="mailto:support@eshop.com"
                className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
              >
                support@eshop.com
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
