// Create src/pages/NotFound.tsx
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-6xl font-bold text-[var(--color-text-dim)] mb-4">404</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 font-light">
          This page doesn't exist.
        </p>
        <a
          href="/"
          className="bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold px-6 py-2.5 rounded-[var(--radius-sm)] hover:bg-white transition-colors duration-150"
        >
          Go home
        </a>
      </div>
    </div>
  );
};

export default NotFound;