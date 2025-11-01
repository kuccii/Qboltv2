import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-sm text-gray-600 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
                <h3 className="font-medium text-gray-900 mt-4 mb-2">Component Stack:</h3>
                <pre className="text-sm text-gray-600 overflow-auto">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 