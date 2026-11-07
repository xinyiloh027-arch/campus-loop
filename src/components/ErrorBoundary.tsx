import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CampusLoop Uncaught React Boundary Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CampusLoop Display Notice
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                A display error was caught. You can reload the page or reset the local cache to restore the marketplace.
              </p>
              {this.state.error?.message && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono text-left max-h-24 overflow-y-auto break-all">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
