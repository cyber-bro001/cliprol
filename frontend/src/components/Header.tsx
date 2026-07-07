import { AlignRight, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <nav className="flex items-center justify-between py-8 px-6 md:px-12">
        <a
          href="/"
          className="text-[var(--color-text)] font-semibold text-base"
        >
          Cliprol
        </a>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/login"
            className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] transition-colors duration-150"
          >
            Login
          </a>
          <a
            href="/signup"
            className="text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-text)] text-[var(--color-bg)] px-4 py-2 rounded-[var(--radius-sm)]"
          >
            Try it free
          </a>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="text-[var(--color-text)]" />
          ) : (
            <AlignRight className="text-[var(--color-text)]" />
          )}
        </button>
      </nav>

      {/* Mobile menu — same links, no duplication */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] px-6 py-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] transition-colors duration-150"
          >
            Login
          </a>
          <a
            href="/signup"
            className="text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-text)] text-[var(--color-bg)] px-4 py-2 rounded-[var(--radius-sm)] text-center"
          >
            Try it free
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
