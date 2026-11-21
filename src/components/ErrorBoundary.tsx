import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7F4] text-[#171614] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-xl p-8 text-center">
            <h1 className="font-display text-3xl font-semibold mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-[#57534E] mb-6">
              An unexpected error interrupted the roastery view. Reload the page to restore your session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#1C1917] text-[#F8F7F4] text-sm font-medium rounded-lg hover:bg-[#2E2926] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
