import { useCliprolContext } from "../../context/CliprolContext";

const DashboardSettings = () => {
  const { session } = useCliprolContext();

  const email = session?.user?.email || "";
  const name = session?.user?.user_metadata?.name || "";

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-0">

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-light">
          Manage your account.
        </p>
      </div>

      {/* Account */}
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Account
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-[var(--color-text-dim)] mb-1">Name</p>
            <p className="text-sm text-[var(--color-text)]">{name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-dim)] mb-1">Email</p>
            <p className="break-words text-sm text-[var(--color-text)]">{email}</p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Plan
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">Free</p>
            <p className="text-xs text-[var(--color-text-muted)] font-light mt-0.5">
              Basic access to Cliprol.
            </p>
          </div>
          <button className="cursor-not-allowed rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-[var(--color-bg)] opacity-50 sm:py-1.5">
            Upgrade
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardSettings;
