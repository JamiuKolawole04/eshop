"use client";

import Link from "next/link";

import { useStore } from "@/store";
import { useUser } from "@/hooks/use-user";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useDeviceTracking } from "@/hooks/use-device-tracking";
import Image from "next/image";

const Page = () => {
  const { user } = useUser();
  const { addToCart, removeFromWishlist, wishlist } = useStore();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const decreaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id && (item.quantity as number) > 1
          ? { ...item, quantity: (item.quantity as number) - 1 }
          : item,
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item,
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };

  return (
    <div className={`w-full bg-white font-Poppins`}>
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-6 md:pb-[50px]">
          <h1 className="pt-6 md:pt-[50px] font-medium text-3xl md:text-[44px] leading-[1] mb-4">
            Wishlist
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>

          <span className="text-[#55585b]">Wishlist</span>
        </div>

        {wishlist?.length === 0 ? (
          <div className="text-center text-gray-600 text-base md:text-lg">
            Your wishlist is empty! Start adding products.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <table className="w-full border-collapse block md:table">
              <thead className="hidden md:table-header-group bg-[#f1f3f4]">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>

              <tbody className="block md:table-row-group">
                {wishlist?.map((item) => (
                  <tr
                    key={item.id}
                    className="block md:table-row border-b border-b-[#0000000e] py-3 md:py-0"
                  >
                    {/* Product */}
                    <td className="flex items-center gap-3 p-2 md:p-4 md:table-cell">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.images[0].url}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="rounded w-16 h-16 md:w-20 md:h-20 object-cover shrink-0"
                        />

                        <span className="text-sm md:text-base line-clamp-2 min-w-0">
                          {item.title}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="flex justify-between items-center px-2 py-1 md:px-6 md:py-0 md:table-cell md:text-lg">
                      <span className="md:hidden text-sm text-gray-500">
                        Price
                      </span>
                      <span>${item?.sale_price.toFixed(2)}</span>
                    </td>

                    {/* Quantity */}
                    <td className="flex justify-between items-center px-2 py-1 md:p-0 md:table-cell">
                      <span className="md:hidden text-sm text-gray-500">
                        Quantity
                      </span>
                      <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[80px] md:w-[70px] p-[2px]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="text-black cursor-pointer text-xl px-1"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>

                        <span className="px-2">{item?.quantity}</span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="text-black cursor-pointer text-xl px-1"
                          onClick={() => increaseQuantity(item?.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Add to cart + Remove (mobile) */}
                    <td className="flex items-center justify-between gap-3 px-2 pt-2 md:p-0 md:table-cell">
                      <button
                        type="button"
                        className="flex-1 md:flex-none bg-[#2295ff] text-sm cursor-pointer text-white px-5 py-2 rounded-md hover:bg-[#007bff] transition-all"
                        onClick={() =>
                          addToCart(item, user, location, deviceInfo)
                        }
                      >
                        Add To Cart
                      </button>

                      <button
                        type="button"
                        className="md:hidden text-[#818487] text-xs cursor-pointer hover:text-[#ff1826] transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        X Remove
                      </button>
                    </td>

                    {/* Remove (desktop only) */}
                    <td className="hidden md:table-cell">
                      <button
                        type="button"
                        className="text-[#818487] text-xs cursor-pointer hover:text-[#ff1826] transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        X Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
