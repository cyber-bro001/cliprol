import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-xl font-semibold text-[var(--color-text)] mb-3 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] font-light mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold px-6 py-2.5 rounded-[var(--radius-sm)] hover:bg-white transition-colors duration-150"
            >
              Go home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;