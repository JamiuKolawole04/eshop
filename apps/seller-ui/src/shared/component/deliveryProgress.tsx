import {
  Package,
  PackageCheck,
  Truck,
  MapPinned,
  CheckCircle2,
  Check,
} from "lucide-react";

type DeliveryStatus =
  "Ordered" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered";

const STEP_CONFIG: { label: DeliveryStatus; icon: typeof Package }[] = [
  { label: "Ordered", icon: Package },
  { label: "Packed", icon: PackageCheck },
  { label: "Shipped", icon: Truck },
  { label: "Out for Delivery", icon: MapPinned },
  { label: "Delivered", icon: CheckCircle2 },
];

export function DeliveryProgress({ status }: { status: DeliveryStatus }) {
  const currentIndex = STEP_CONFIG.findIndex((s) => s.label === status);
  const fillPercent =
    currentIndex <= 0 ? 0 : (currentIndex / (STEP_CONFIG.length - 1)) * 100;

  return (
    <div className="mb-10 rounded-xl border border-gray-800 bg-gray-900/40 p-5 sm:p-8">
      {/* Desktop / tablet: horizontal timeline */}
      <div className="hidden sm:block relative">
        <div className="absolute top-5 left-5 right-5 h-1 bg-gray-800 rounded-full" />
        <div
          className="absolute top-5 left-5 h-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
          style={{
            width:
              fillPercent === 0
                ? 0
                : `calc(${fillPercent}% - ${40 * (fillPercent / 100)}px)`,
          }}
        />

        <div className="relative flex justify-between">
          {STEP_CONFIG.map((step, idx) => {
            const isComplete = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isActive = isComplete || isCurrent;
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="flex flex-col items-center flex-1 group"
              >
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
                  )}
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300
                      ${
                        isActive
                          ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/30"
                          : "bg-gray-900 border-gray-700"
                      }
                      ${isCurrent ? "scale-110" : ""}`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-white" : "text-gray-500"}
                      strokeWidth={2}
                    />
                  </div>
                  {isComplete && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                <span
                  className={`mt-3 text-xs font-medium text-center px-1 transition-colors ${
                    isActive ? "text-blue-400" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-blue-300/80 uppercase">
                    Current status
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden flex flex-col">
        {STEP_CONFIG.map((step, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isActive = isComplete || isCurrent;
          const isLast = idx === STEP_CONFIG.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
                  )}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300
                      ${
                        isActive
                          ? "bg-blue-500 border-blue-400 shadow-md shadow-blue-500/30"
                          : "bg-gray-900 border-gray-700"
                      }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-white" : "text-gray-500"}
                      strokeWidth={2}
                    />
                  </div>
                  {isComplete && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                      <Check size={8} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[32px] rounded-full transition-colors duration-500 ${
                      isComplete ? "bg-blue-500" : "bg-gray-800"
                    }`}
                  />
                )}
              </div>
              <div className="pb-8 pt-1.5">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-blue-400" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] font-semibold tracking-wide text-blue-300/80 uppercase mt-0.5">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
