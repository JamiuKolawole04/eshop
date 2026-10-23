/* eslint-disable @typescript-eslint/no-explicit-any */

import { X } from "lucide-react";

import { DiscountCode } from "@packages/ui";

type Props = {
  discount: DiscountCode;
  onClose: () => void;
  onConfirm?: any;
};

export const DeleteDiscountCodeModal = ({
  discount,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <div className="fixed inset-0 p-4 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-[450px] max-h-[90dvh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Discount Code</h3>

          <button className="text-gray-700 hover:text-white" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <p className="text-gray-300 mt-4 text-sm">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {discount.public_name}
          </span>{" "}
          ?
          <br />
          This action **cannot be undone**.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-md text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-white font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
