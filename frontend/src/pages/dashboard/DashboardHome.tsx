import { useNavigate } from "react-router-dom";
import { useCliprolContext } from "../../context/CliprolContext";
import { Plus, Video, Clock } from "lucide-react";

const DashboardHome = () => {
  const { session } = useCliprolContext();
  const navigate = useNavigate();

  const name = session?.user?.user_metadata?.name || "there";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-0">

      {/* Greeting */}
      <div className="mb-8 sm:mb-10">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Hey, {name} 
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-light">
          Ready to find your best moments?
        </p>
      </div>

      {/* New project CTA */}
      <div
        onClick={() => navigate("/dashboard/new-project")}
        className="mb-8 cursor-pointer rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-6 text-center transition-colors duration-150 hover:border-[var(--color-text-muted)] sm:mb-10 sm:p-10"
      >
        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
          <Plus size={18} className="text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text)] mb-1">
          New project
        </p>
        <p className="text-xs text-[var(--color-text-muted)] font-light">
          Paste a YouTube link or upload a video
        </p>
      </div>

      {/* Tools */}
      <div className="mb-6">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Available tools
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <Video size={18} className="text-[var(--color-accent)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">
              Auto Clip
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] font-light leading-relaxed">
              Find and clip the best moments from any long video automatically.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 opacity-40">
            <Clock size={18} className="text-[var(--color-text-muted)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">
              Caption Generator
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] font-light leading-relaxed">
              Auto-generate captions for your clips. Coming soon.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
