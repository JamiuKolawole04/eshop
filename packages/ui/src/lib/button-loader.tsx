import { Loader2 } from "lucide-react";

type ButtonLoaderProps = {
  size?: number;
  className?: string;
};

export const ButtonLoader = ({
  size = 14,
  className = "",
}: ButtonLoaderProps) => {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};
