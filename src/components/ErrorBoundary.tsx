import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center" dir="rtl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">حدث خطأ غير متوقع</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            نعتذر عن هذا الخطأ. يرجى إعادة تحميل الصفحة أو العودة إلى الصفحة الرئيسية.
          </p>
          {this.state.error && (
            <pre className="mb-6 max-w-lg rounded-lg bg-muted p-4 text-xs text-muted-foreground text-left overflow-auto" dir="ltr">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}