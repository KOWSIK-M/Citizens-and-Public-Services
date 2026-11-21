import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

interface ErrorFallbackViewProps {
  errorMessage: string | null;
  onReload: () => void;
  onGoHome: () => void;
}

const ErrorFallbackView: React.FC<ErrorFallbackViewProps> = ({
  errorMessage,
  onReload,
  onGoHome,
}) => {
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6" role="alert">
      <Card className="border-2 border-warning-border bg-white shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-warning-surface border border-warning-border flex items-center justify-center text-warning">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className={`text-xl md:text-2xl font-bold text-body ${getFontClass()}`}>
            {pick(
              'Something went wrong while loading this view',
              'ఈ పేజీని లోడ్ చేయడంలో చిన్న అంతరాయం ఏర్పడింది',
              'इस पृष्ठ को लोड करते समय कुछ समस्या आई'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className={`text-sm md:text-base text-muted leading-relaxed ${getFontClass()}`}>
            {pick(
              'Your saved scheme checklist and coarse session details remain safe on your device. Please reload the page or return to the home screen.',
              'మీ పరికరంలో సేవ్ చేసిన పథకాల వివరాలు సురక్షితంగా ఉన్నాయి. దయచేసి పేజీని రీలోడ్ చేయండి లేదా హోమ్ పేజీకి వెళ్లండి.',
              'आपके डिवाइस पर सहेजी गई योजना सूची सुरक्षित है। कृपया पृष्ठ को रीलोड करें या मुख्य पृष्ठ पर लौटें।'
            )}
          </p>

          {errorMessage && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono break-words">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="default"
              onClick={onReload}
              className={`w-full sm:w-auto inline-flex items-center gap-2 ${getFontClass()}`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Reload Page', 'పేజీని రీలోడ్ చేయండి', 'पेज रीलोड करें')}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onGoHome}
              className={`w-full sm:w-auto inline-flex items-center gap-2 ${getFontClass()}`}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>{pick('Go Home', 'హోమ్ పేజీకి వెళ్లండి', 'मुख्य पृष्ठ पर जाएं')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || null,
    };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    // Intentionally omit console logging of user state for privacy defense-in-depth
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, errorMessage: null });
    if (typeof window !== 'undefined') {
      window.location.assign(ROUTES.HOME);
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallbackView
          errorMessage={this.state.errorMessage}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}
