import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Settings, LogOut } from "lucide-react";
import { useCliprolContext } from "../context/CliprolContext";

const DashboardLayout = () => {
  const { signOut } = useCliprolContext();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState(false);

  const handleLogout = async () => {
    setLogoutError(false);
    const result = await signOut();
    if (!result.success) {
      setLogoutError(true);
      return;
    }
    navigate("/");
  };

  const navItems = [
    { label: "Home", icon: Home, path: "/dashboard" },
    { label: "Projects", icon: FolderOpen, path: "/dashboard/projects" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-[var(--color-border)] bg-[var(--color-bg)] md:inset-y-0 md:left-0 md:right-auto md:h-full md:w-56 md:flex-col md:border-r md:border-t-0">
        {/* Logo */}
        <div className="hidden border-b border-[var(--color-border)] px-5 py-5 md:block">
          <span className="text-base font-bold text-[var(--color-text)] tracking-tight">
            Cliprol
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 items-center justify-around gap-1 p-2 md:flex-col md:items-stretch md:justify-start md:p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center gap-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-150 md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
                  isActive
                    ? "bg-[var(--color-surface2)] text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-l border-[var(--color-border)] p-2 md:border-l-0 md:border-t md:p-3">
          {logoutError && <p role="alert" className="mb-2 text-xs text-red-400">Unable to sign out. Please try again.</p>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] md:w-full"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 pb-24 pt-6 sm:px-6 md:ml-56 md:min-h-screen md:p-8 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
