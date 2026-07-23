'use client';

interface LoadingSpinnerProps {
  message?: string;
  detail?: string;
}

export function LoadingSpinner({
  message = 'Scanning...',
  detail,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-emerald-500" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {detail ? <p className="mt-1 text-xs text-subtle">{detail}</p> : null}
      </div>
    </div>
  );
}
