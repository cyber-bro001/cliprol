import { Circle, CircleCheck } from "lucide-react";

type ProcessingStateProps = {
  currentStage: number;
  stages: string[];
};

const ProcessingState = ({ currentStage, stages }: ProcessingStateProps) => {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Cliprol
          </h1>
          <p className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-3xl">
            Finding the moments worth posting.
          </p>
        </div>

        <div className="mt-10 space-y-4 sm:mt-14 sm:space-y-6">
          {stages.map((stage, index) => {
            const completed = index < currentStage;
            const active = index === currentStage - 1;

            return (
              <div key={`${stage}-${index}`} className="flex items-start gap-3 sm:items-center sm:gap-4">
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
                        : "text-[var(--color-text-muted)]"
                    }`}
                  />
                )}
                <span
                  className={`min-w-0 text-sm font-medium leading-6 transition-colors duration-300 sm:text-base ${
                    active
                      ? "text-[var(--color-text)]"
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

        <p className="mt-10 text-center text-sm text-[var(--color-text-muted)] sm:mt-14">
          This usually takes less than a minute.
        </p>
      </div>
    </section>
  );
};

export default ProcessingState;
