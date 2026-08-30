import PreviewFrame from "./PreviewFrame";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Upload a video",
      description:
        "Paste a YouTube link or upload a video directly from your device.",
      preview: "Landing Preview",
    },
    {
      step: "02",
      title: "Cliprol gets to work",
      description:
        "Your video is processed and the moments worth keeping are identified automatically.",
      preview: "Processing Preview",
    },
    {
      step: "03",
      title: "Review and download",
      description:
        "Preview each clip, decide which ones to keep, and download them individually.",
      preview: "Results Preview",
    },
  ];

  return (
    <section id="howitworks" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="text-sm text-[var(--color-text-muted)]">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[var(--color-text)] md:text-4xl">
            Three simple steps.
          </h2>

          <p className="mt-5 leading-8 text-[var(--color-text-muted)]">
            No complicated workflow. Upload your video, let Cliprol process it,
            then download the clips you want to share.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`grid gap-10 py-12 md:grid-cols-2 md:[direction:rtl] ${
                index !== steps.length - 1
                  ? "border-b border-[var(--color-border)]"
                  : ""
              }`}
            >
              {/* Text */}
              <div className="flex flex-col justify-center">
                <p className="text-sm tracking-[0.2em] uppercase text-[var(--color-text-dim)]">
                  Step {step.step}
                </p>

                <h3 className="mt-3 text-2xl font-medium text-[var(--color-text)]">
                  {step.title}
                </h3>

                <p className="mt-5 leading-8 text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </div>

              {/* Preview */}
              <PreviewFrame title={step.preview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;