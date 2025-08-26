// components/error-boundary.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (never log sensitive data)
    console.error("[ErrorBoundary]", {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Truncate stack trace
      componentStack: errorInfo.componentStack?.substring(0, 200),
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Bir Şeyler Ters Gitti
          </CardTitle>
          <CardDescription>
            Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                Geliştirici Bilgisi:
              </p>
              <p className="text-xs text-red-700 mt-1">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Sayfayı Yenile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Page-level error boundary for specific pages
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Here you could send to analytics/monitoring
        // Never send sensitive user data
        console.error("[PageError]", error.message);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// API error boundary for handling async errors
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ retry }) => (
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Veriler yüklenirken bir hata oluştu
            </p>
            <Button onClick={retry} size="sm">
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
