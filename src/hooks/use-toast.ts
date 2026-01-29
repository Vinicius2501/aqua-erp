import { toast } from "sonner";

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  };
}

export { useToast, toast };
