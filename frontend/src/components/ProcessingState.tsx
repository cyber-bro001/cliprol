import { Circle, CircleCheck } from "lucide-react";

type ProcessingStateProps = {
  currentStage: number;
};

const ProcessingState = ({ currentStage }: ProcessingStateProps) => {
  const stages = [
    "Preparing video",
    "Analyzing content",
    "Finding key moments",
    "Creating clips",
    "Finalizing",
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Cliprol
          </h1>

          <p className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)]">
            Finding the moments worth posting.
          </p>
        </div>

        {/* Processing Stages */}
        <div className="mt-14 space-y-6">
          {stages.map((stage, index) => {
            const completed = index < currentStage;
            const active = index === currentStage;

            return (
              <div key={stage} className="flex items-center gap-4">
                {completed ? (
                  <CircleCheck
                    size={22}
                    className="text-[var(--color-accent)] shrink-0"
                  />
                ) : (
                  <Circle
                    size={22}
                    className={`shrink-0 ${
                      active
                        ? "text-[var(--color-text)]"
                        : completed
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-text-muted)]"
                    }`}
                  />
                )}

                <span
                  className={`text-base font-medium transition-colors duration-300 ${
                    active
                      ? "animate-stage"
                      : completed
                        ? "text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-14 text-center text-sm text-[var(--color-text-muted)]">
          This usually takes less than a minute.
        </p>
      </div>
    </section>
  );
};

export default ProcessingState;
