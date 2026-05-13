'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#000000' }}>
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: '#999999' }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#00FF00', color: '#000000' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
