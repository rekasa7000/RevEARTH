"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error to backend
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          level: "error",
          url: typeof window !== "undefined" ? window.location.href : undefined,
          metadata: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          },
        }),
      });
    } catch (logError) {
      // If logging fails, just console error it
      console.error("Failed to log error to backend:", logError);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription className="mt-1">
                    We encountered an unexpected error. Please try again.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Error Details (Development Mode)</p>
                  <div className="rounded bg-background p-3 border">
                    <p className="text-sm font-mono text-destructive break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                  {this.state.errorInfo && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Component Stack
                      </summary>
                      <pre className="mt-2 rounded bg-background p-3 border overflow-auto max-h-48 text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact support with the following information:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>What you were trying to do when the error occurred</li>
                  <li>The page or feature you were using</li>
                  <li>Any error messages displayed above</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level Error Boundary
 * Lighter error UI for page-level errors
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Unable to Load Page</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            We encountered an error while loading this page. Please refresh to try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level Error Boundary
 * Minimal error UI for individual components
 */
export function ComponentErrorBoundary({ children, componentName }: { children: ReactNode; componentName?: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {componentName ? `Error loading ${componentName}` : "Component Error"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This component failed to load. Try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
