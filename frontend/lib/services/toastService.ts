// frontend\lib\utils\ToastService.ts
import { toast } from "@/hooks/use-toast";

export interface ToastMessage {
  title?: string;
  description: string;
  type?: "success" | "error" | "warning" | "info" | "default" | "destructive";
  duration?: number;
}

export class ToastService {
  static show(message: ToastMessage) {
    const { title, description, type = "info", duration = 5000 } = message;

    type ToastType = "success" | "error" | "warning" | "info";
    const variantMap: Record<
      ToastType,
      "success" | "destructive" | "warning" | "default"
    > = {
      success: "success",
      error: "destructive",
      warning: "warning",
      info: "default",
    };

    const safeType: ToastType = [
      "success",
      "error",
      "warning",
      "info",
    ].includes(type)
      ? (type as ToastType)
      : "info";

    const variant = variantMap[safeType];

    return toast({
      title,
      description,
      variant,
      duration,
    });
  }
  static success(message: string, title?: string) {
    return this.show({
      description: message,
      type: "success",
    });
  }

  static error(message: string, title?: string) {
    return this.show({
      title: title,
      description: message,
      type: "error",
    });
  }

  static warning(message: string, title?: string) {
    return this.show({
      description: message,
      type: "warning",
    });
  }

  static info(message: string, title?: string) {
    return this.show({
      description: message,
      type: "info",
    });
  }

  static networkError(
    message = "Network error. Please check your connection and try again.",
  ) {
    return this.error(message, "Network Error");
  }

  static serverError(message = "Server error. Please try again later.") {
    return this.error(message, "Server Error");
  }

  static validationError(message: string) {
    return this.warning(message, "Validation Error");
  }
}