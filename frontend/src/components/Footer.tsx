const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 md:flex-row md:items-end md:justify-between">
        {/* Brand */}
        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            Cliprol
          </h2>

<p className="mt-4 leading-8 text-[var(--color-text-muted)]">
            Less time editing.
            <br />
            More time creating.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3 text-sm text-[var(--color-text-muted)] md:items-end">
          <a
            href="#"
            className="transition-colors duration-150 hover:text-[var(--color-text)]"
          >
            Privacy
          </a>

          <a
            href="#"
            className="transition-colors duration-150 hover:text-[var(--color-text)]"
          >
            Terms
          </a>

          <a
            href="#"
            className="transition-colors duration-150 hover:text-[var(--color-text)]"
          >
            Contact
          </a>

          <p className="mt-6 text-xs text-[var(--color-text-dim)]">
            © 2026 Cliprol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;