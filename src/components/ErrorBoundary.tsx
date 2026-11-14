import React from 'react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error) {
    console.error('COZY_ESPORTS ErrorBoundary caught:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-5 text-center">
          <div className="max-w-sm w-full bg-[#0e1424] border border-red-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h1 className="font-display text-lg font-black text-white">
              COZY<span className="text-red-500">_ESPORTS</span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Something went wrong on this browser. Please reload to continue.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold text-xs uppercase rounded-xl"
              >
                Reload App
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Clear Cache &amp; Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
