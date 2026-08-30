import PreviewFrame from "./PreviewFrame";

const WhyCliprol = () => {
  const reasons = [
    {
      title: "Save hours",
      description:
        "Stop scrubbing through long recordings looking for highlights. Cliprol helps you get to the moments that matter faster.",
      preview: "Timeline Preview",
    },
    {
      title: "Stay in control",
      description:
        "Every clip is yours to review, download, and decide what gets shared. Nothing is published without you.",
      preview: "Clip Preview",
    },
    {
      title: "Built for creators",
      description:
        "From podcasts and interviews to gameplay, tutorials, and livestreams, Cliprol fits naturally into your workflow.",
      preview: "Creator Preview",
    },
  ];

  return (
    <section id="whycliprol" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="text-sm text-[var(--color-text-muted)]">
            Why Cliprol
          </p>

          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[var(--color-text)] md:text-4xl">
            Every long video is full of moments worth sharing.
          </h2>

          <p className="mt-5 leading-8 text-[var(--color-text-muted)]">
            Finding them shouldn't take longer than creating them. Cliprol helps
            you spend less time editing and more time publishing.
          </p>
        </div>

        {/* Content */}
        <div className="mt-20">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className={`grid gap-10 py-12 md:grid-cols-2 ${
                index !== reasons.length - 1
                  ? "border-b border-[var(--color-border)]"
                  : ""
              }`}
            >
              {/* Text */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-medium text-[var(--color-text)]">
                  {reason.title}
                </h3>

                <p className="mt-5 leading-8 text-[var(--color-text-muted)]">
                  {reason.description}
                </p>
              </div>

              {/* Preview */}
              <PreviewFrame title={reason.preview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCliprol;