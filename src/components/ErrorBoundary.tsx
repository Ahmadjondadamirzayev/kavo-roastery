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
        <div className="min-h-screen bg-[#0B0908] text-[#FAF6F0] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#161210] border border-[#2A221D] rounded-xl p-8 text-center">
            <h1 className="font-display text-3xl font-semibold mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-[#B8ABA0] mb-6">
              An unexpected error interrupted the roastery view. Reload the page to restore your session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#D4A373] text-[#0B0908] text-sm font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors cursor-pointer"
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
