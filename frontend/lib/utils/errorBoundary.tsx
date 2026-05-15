import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorHandler, ErrorType, ErrorSeverity } from "./errorHandler";
import type { ApiError } from "../api/index";

// Error Boundary Props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorType?: ErrorType;
  severity?: ErrorSeverity;
}

// Error Boundary State
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Error Boundary Component
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show error toast
    ErrorHandler.showErrorToast(
      "Something went wrong",
      "An unexpected error occurred. Please refresh the page.",
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-red-500 mb-4">
              An unexpected error occurred. Please refresh the page or contact
              support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
}

// Error Context
interface ErrorContextType {
  error: Error | ApiError | null;
  setError: (error: Error | ApiError | null) => void;
  clearError: () => void;
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(
  undefined,
);

// Error Provider
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = React.useState<Error | ApiError | null>(null);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo(
    () => ({
      error,
      setError,
      clearError,
    }),
    [error, clearError],
  );

  return (
    <ErrorContext.Provider value={value}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ErrorContext.Provider>
  );
}

// Error Hook
export function useError() {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

// Async Error Hook
export function useAsyncError() {
  const { setError } = useError();

  const handleAsyncError = React.useCallback(
    (error: Error | ApiError) => {
      setError(error);
      ErrorHandler.handleApiError(error, "Component");
    },
    [setError],
  );

  return { handleAsyncError };
}

// Error Display Component
interface ErrorDisplayProps {
  error?: Error | ApiError | null;
  fallback?: ReactNode;
  className?: string;
}

export function ErrorDisplay({
  error,
  fallback,
  className = "",
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
          </div>
          {fallback && <div className="mt-4">{fallback}</div>}
        </div>
      </div>
    </div>
  );
}

// Loading Error Component
interface LoadingErrorProps {
  error: Error | null;
  isLoading: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function LoadingError({
  error,
  isLoading,
  children,
  fallback,
}: LoadingErrorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return fallback || <ErrorDisplay error={error} />;
  }

  return <>{children}</>;
}

// Retry Button Component
interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  className?: string;
}

export function RetryButton({
  onRetry,
  isLoading = false,
  className = "",
}: RetryButtonProps) {
  return (
    <button
      onClick={onRetry}
      disabled={isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? "Retrying..." : "Try Again"}
    </button>
  );
}

// Error Recovery Component
interface ErrorRecoveryProps {
  error: Error | null;
  onRetry: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
}

export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  isLoading = false,
}: ErrorRecoveryProps) {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <RetryButton onRetry={onRetry} isLoading={isLoading} />
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
