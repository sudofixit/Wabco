import toast from "react-hot-toast";

export function useToast() {
  const success = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  return {
    success,
    error,
  };
} 