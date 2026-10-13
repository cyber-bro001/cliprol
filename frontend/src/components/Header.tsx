import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";
import LogoMark from "./LogoMark";
import { focusVideoInput, landingLinks as links } from "./landing/landingNavigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { session } = useCliprolContext();
  const isLanding = useLocation().pathname === "/";
  const sectionHref = (hash: string) => isLanding ? hash : `/${hash}`;

  return (
    <header className="site-header" onKeyDown={event => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    }}>
      {isLanding && <a href="#main" className="skip-link">Skip to content</a>}
      <nav className="header-inner page-width" aria-label="Main">
        <Link to="/" className="brand"><LogoMark /><span>Cliprol</span></Link>
        <div className="desktop-nav">
          {links.map(link => <a key={link.href} href={sectionHref(link.href)}>{link.label}</a>)}
        </div>
        <div className="header-actions">
          <Link to={session ? "/dashboard" : "/login"} className="header-account">{session ? "Dashboard" : "Sign in"}</Link>
          {!session && <a href={sectionHref("#video-input")} className="button-primary header-cta" onClick={focusVideoInput}>Get started</a>}
          <button id="menu-toggle" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav page-width" aria-label="Mobile">
          {links.map(link => <a key={link.href} href={sectionHref(link.href)} onClick={() => setOpen(false)}>{link.label}</a>)}
        </nav>
      )}
    </header>
  );
}
