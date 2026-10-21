import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** When this value changes (e.g. the route path) a caught error is cleared. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    // Plain <a> (not <Link>) so the fallback also works above the router.
    return (
      <div
        role="alert"
        className="flex min-h-[70vh] items-center justify-center bg-background px-6 text-foreground"
      >
        <div className="glass max-w-md rounded-lg p-8 text-center">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Signal lost
          </p>
          <h1 className="mb-3 text-2xl font-semibold">Something went wrong</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            This page hit an unexpected error. Reloading usually fixes it, or you can head back home.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-primary px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reload
            </button>
            <a
              href="/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Back home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
