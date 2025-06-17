import { ButtonHTMLAttributes } from "react";
import SpinnerIcon from "./SpinnerIcon";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export default function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled || isLoading
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-opacity-90"
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <>
          <SpinnerIcon className="mr-2" />
          {loadingText || "Loading..."}
        </>
      )}
      {!isLoading && children}
    </button>
  );
} 