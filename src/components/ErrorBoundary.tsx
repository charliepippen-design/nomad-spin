import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="font-mono text-2xl tracking-[0.15em] text-foreground uppercase">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              An unexpected error occurred. Please reload the page to continue.
            </p>
            {import.meta.env.DEV && this.state.errorMessage && (
              <pre className="mt-2 rounded-lg border border-destructive/30 bg-destructive/[0.05] p-4 text-left text-xs text-destructive/80 font-mono overflow-auto">
                {this.state.errorMessage}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border/50 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-mono tracking-[0.15em] text-foreground/70 hover:text-foreground transition-all uppercase"
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
