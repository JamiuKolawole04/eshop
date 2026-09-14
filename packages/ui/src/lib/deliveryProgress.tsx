import { Check } from "lucide-react";

import { DeliveryStatus } from "../types/order";

const STEP_CONFIG: { label: DeliveryStatus }[] = [
  { label: "Ordered" },
  { label: "Packed" },
  { label: "Shipped" },
  { label: "Out for Delivery" },
  { label: "Delivered" },
];

export function DeliveryProgress({ status }: { status: DeliveryStatus }) {
  const currentIndex = STEP_CONFIG.findIndex((s) => s.label === status);

  const progress =
    currentIndex <= 0 ? 0 : (currentIndex / (STEP_CONFIG.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-lg shadow-black/20 sm:p-6 md:p-8">
      <div className="relative">
        {/* Labels */}
        <div className="mb-4 flex justify-between">
          {STEP_CONFIG.map((step, idx) => {
            const isComplete = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={step.label}
                className="flex min-w-0 flex-1 flex-col items-center px-0.5"
              >
                <span
                  className={`text-center text-[10px] leading-tight break-words transition-colors sm:text-xs md:text-sm ${
                    isCurrent
                      ? "font-semibold text-blue-300"
                      : isComplete
                        ? "font-medium text-gray-300"
                        : "font-medium text-gray-600"
                  }`}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide text-blue-400 sm:text-[10px]">
                    Current status
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="relative h-6">
          {/* Track */}
          <div className="absolute left-[10%] right-[10%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gray-800" />

          {/* Filled track */}
          <div
            className="absolute left-[10%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
            style={{
              width: `${(progress * 80) / 100}%`,
            }}
          />

          {/* Dots */}
          <div className="relative flex h-full w-full items-center justify-between">
            {STEP_CONFIG.map((step, idx) => {
              const isComplete = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <span
                  key={step.label}
                  className="relative flex flex-1 justify-center"
                >
                  {isCurrent && (
                    <span className="absolute h-6 w-6 animate-ping rounded-full bg-blue-500/30" />
                  )}

                  {isComplete ? (
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-md shadow-blue-500/30">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </span>
                  ) : isCurrent ? (
                    <span className="relative z-10 h-5 w-5 rounded-full border-2 border-blue-300 bg-blue-500 shadow-md shadow-blue-500/40" />
                  ) : (
                    <span className="relative z-10 h-4 w-4 rounded-full border-2 border-gray-700 bg-gray-900" />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
