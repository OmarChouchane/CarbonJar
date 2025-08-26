interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-green font-Inter mb-2 text-lg font-medium">Something went wrong</h3>
          <p className="font-Inter mb-4 text-red-500">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-green hover:bg-green/90 font-Inter rounded-lg px-4 py-2 font-medium text-white transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
