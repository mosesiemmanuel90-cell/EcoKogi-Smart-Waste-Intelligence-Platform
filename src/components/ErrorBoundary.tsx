import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ServerError } from '../pages/ServerError';

interface ErrorBoundaryProps {
  children: ReactNode;
  onGoHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('EcoKogi Error Boundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ServerError
          error={this.state.error ?? undefined}
          errorInfo={this.state.errorInfo ?? undefined}
          onRetry={this.handleRetry}
          onGoHome={this.props.onGoHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;