import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Do I need an account to use Cliprol?",
    answer:
      "No. You can use Cliprol without creating an account. An account simply unlocks additional features like saved history and a personal dashboard.",
  },
  {
    question: "Can I upload my own videos?",
    answer:
      "Yes. You can either paste a YouTube link or upload a video directly from your device.",
  },
  {
    question: "How long does processing take?",
    answer:
      "It depends on the length of your video. Most videos are processed within a few minutes.",
  },
  {
    question: "Who owns the clips?",
    answer:
      "You do. Cliprol processes your content but does not claim ownership of your videos or the clips created from them.",
  },
  {
    question: "What videos work best?",
    answer:
      "Cliprol works well with podcasts, gameplay, interviews, tutorials, livestreams, presentations, and other long-form videos.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Frequently asked questions
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[var(--color-text)] md:text-4xl">
            A few things you might want to know.
          </h2>
        </div>

        {/* Questions */}
        <div className="mt-20 border-t border-[var(--color-border)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-b border-[var(--color-border)]"
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between py-6 text-left cursor-pointer"
                >
                  <span className="text-lg font-medium text-[var(--color-text)]">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="pb-6 pr-8">
                    <p className="leading-8 text-[var(--color-text-muted)]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;