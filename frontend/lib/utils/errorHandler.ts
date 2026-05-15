import { toast } from "../../hooks/use-toast";
import type { ApiError } from "../api/index";

// Error Types
export enum ErrorType {
  AUTH_ERROR = "auth_error",
  VALIDATION_ERROR = "validation_error",
  NETWORK_ERROR = "network_error",
  SERVER_ERROR = "server_error",
  PERMISSION_ERROR = "permission_error",
  NOT_FOUND_ERROR = "not_found_error",
  UNKNOWN_ERROR = "unknown_error",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error Configuration
export interface ErrorConfig {
  type: ErrorType;
  severity: ErrorSeverity;
  showToast: boolean;
  toastTitle: string;
  toastDescription?: string;
  logError: boolean;
  redirectTo?: string;
  fallbackMessage?: string;
}

// Error Handler Class
export class ErrorHandler {
  private static errorConfigs: Map<string, ErrorConfig> = new Map([
    // Auth Errors
    [
      "401",
      {
        type: ErrorType.AUTH_ERROR,
        severity: ErrorSeverity.HIGH,
        showToast: true,
        toastTitle: "Authentication Required",
        toastDescription: "Please log in to continue",
        logError: true,
        redirectTo: "/login",
      },
    ],
    [
      "403",
      {
        type: ErrorType.PERMISSION_ERROR,
        severity: ErrorSeverity.HIGH,
        showToast: true,
        toastTitle: "Access Denied",
        toastDescription: "You don't have permission to perform this action",
        logError: true,
      },
    ],

    // Validation Errors
    [
      "400",
      {
        type: ErrorType.VALIDATION_ERROR,
        severity: ErrorSeverity.MEDIUM,
        showToast: true,
        toastTitle: "Invalid Input",
        toastDescription: "Please check your input and try again",
        logError: true,
      },
    ],

    // Not Found Errors
    [
      "404",
      {
        type: ErrorType.NOT_FOUND_ERROR,
        severity: ErrorSeverity.MEDIUM,
        showToast: true,
        toastTitle: "Not Found",
        toastDescription: "The requested resource was not found",
        logError: true,
      },
    ],

    // Server Errors
    [
      "500",
      {
        type: ErrorType.SERVER_ERROR,
        severity: ErrorSeverity.CRITICAL,
        showToast: true,
        toastTitle: "Server Error",
        toastDescription:
          "Something went wrong on our end. Please try again later",
        logError: true,
      },
    ],

    // Network Errors
    [
      "NETWORK_ERROR",
      {
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.HIGH,
        showToast: true,
        toastTitle: "Connection Error",
        toastDescription: "Please check your internet connection and try again",
        logError: true,
      },
    ],

    // Timeout Errors
    [
      "408",
      {
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
        showToast: true,
        toastTitle: "Request Timeout",
        toastDescription: "The request took too long. Please try again",
        logError: true,
      },
    ],
  ]);

  // Type guard for ApiError
  private static isApiError(error: Error | ApiError): error is ApiError {
    return (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as ApiError).statusCode === "number"
    );
  }

  // Handle API Errors
  static handleApiError(error: ApiError | Error, context?: string): void {
    const errorKey = this.getErrorKey(error);
    const config = this.getErrorConfig(errorKey);

    // Log error
    if (config.logError) {
      console.error(`[${context || "API"}] Error:`, {
        message: error.message,
        statusCode: this.isApiError(error) ? error.statusCode : undefined,
        timestamp: new Date().toISOString(),
      });
    }

    // Show toast notification
    if (config.showToast) {
      toast({
        title: config.toastTitle,
        description: config.toastDescription || error.message,
        variant:
          config.severity === ErrorSeverity.CRITICAL
            ? "destructive"
            : "default",
      });
    }

    // Handle redirects
    if (config.redirectTo && typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = config.redirectTo!;
      }, 2000);
    }
  }

  // Handle Redux Errors
  static handleReduxError(error: string, actionType: string): void {
    console.error(`[Redux] ${actionType}:`, error);

    toast({
      title: "Action Failed",
      description: error,
      variant: "destructive",
    });
  }

  // Success Messages
  static showSuccessToast(title: string, description?: string): void {
    toast({
      title,
      description,
      variant: "default",
    });
  }

  static showInfoToast(title: string, description?: string): void {
    toast({
      title,
      description,
      variant: "default",
    });
  }

  static showWarningToast(title: string, description?: string): void {
    toast({
      title,
      description,
      variant: "default",
    });
  }

  static showErrorToast(title: string, description?: string): void {
    toast({
      title,
      description,
      variant: "destructive",
    });
  }

  // Utility Methods
  private static getErrorKey(error: ApiError | Error): string {
    if (this.isApiError(error)) {
      return error.statusCode.toString();
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "NETWORK_ERROR";
    }

    return "UNKNOWN_ERROR";
  }

  private static getErrorConfig(errorKey: string): ErrorConfig {
    return (
      this.errorConfigs.get(errorKey) || {
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.MEDIUM,
        showToast: true,
        toastTitle: "An Error Occurred",
        toastDescription: "Something went wrong. Please try again",
        logError: true,
      }
    );
  }

  // Configuration Management
  static addErrorConfig(key: string, config: ErrorConfig): void {
    this.errorConfigs.set(key, config);
  }

  static removeErrorConfig(key: string): void {
    this.errorConfigs.delete(key);
  }

  static getErrorConfigs(): Map<string, ErrorConfig> {
    return new Map(this.errorConfigs);
  }
}

// Convenience Functions
export const handleAuthError = (error: ApiError | Error) => {
  ErrorHandler.handleApiError(error, "Authentication");
};

export const handleApiRequestError = (
  error: ApiError | Error,
  context?: string
) => {
  ErrorHandler.handleApiError(error, context);
};

export const handleReduxActionError = (error: string, actionType: string) => {
  ErrorHandler.handleReduxError(error, actionType);
};

export const showSuccessMessage = (title: string, description?: string) => {
  ErrorHandler.showSuccessToast(title, description);
};

export const showInfoMessage = (title: string, description?: string) => {
  ErrorHandler.showInfoToast(title, description);
};

export const showWarningMessage = (title: string, description?: string) => {
  ErrorHandler.showWarningToast(title, description);
};

export const showErrorMessage = (title: string, description?: string) => {
  ErrorHandler.showErrorToast(title, description);
};

export default ErrorHandler;
