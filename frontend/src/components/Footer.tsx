import { Link, useLocation } from "react-router-dom";
import LogoMark from "./LogoMark";
import { landingLinks } from "./landing/landingNavigation";

export default function Footer() {
  const isLanding = useLocation().pathname === "/";
  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <Link to="/" className="brand"><LogoMark /><span>Cliprol</span></Link>
        <nav aria-label="Footer">
          {landingLinks.map(link => <a key={link.href} href={isLanding ? link.href : `/${link.href}`}>{link.label}</a>)}
        </nav>
        <small>{new Date().getFullYear()} Cliprol</small>
      </div>
    </footer>
  );
}
