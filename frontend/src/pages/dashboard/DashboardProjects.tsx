import { FolderOpen } from "lucide-react";

const DashboardProjects = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-0">

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight mb-1">
          Projects
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-light">
          All your processed videos in one place.
        </p>
      </div>

      {/* Empty state */}
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center sm:p-16">
        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
          <FolderOpen size={18} className="text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          No projects yet
        </p>
        <p className="text-xs text-[var(--color-text-muted)] font-light">
          Process your first video to see it here.
        </p>
      </div>

    </div>
  );
};

export default DashboardProjects;
