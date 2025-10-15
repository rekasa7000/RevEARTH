import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Custom hook that wraps sonner's toast for compatibility with existing code
 * This provides a consistent API across the application
 */
export function useToast() {
  const toast = ({ title, description, variant, action }: ToastOptions) => {
    const message = description || title || "";
    const titleText = title && description ? title : undefined;

    if (variant === "destructive") {
      sonnerToast.error(message, {
        description: titleText,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      });
    } else {
      sonnerToast(message, {
        description: titleText,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      });
    }
  };

  return { toast };
}
