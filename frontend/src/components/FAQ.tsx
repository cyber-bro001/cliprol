import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "Do I need an account?", answer: "Yes. Sign in to create a project, process your video, and return to your saved clips. You can choose your video on this page before signing in." },
  { question: "Can I upload my own videos?", answer: "Yes. Choose Upload video to select a video from your device, or use a YouTube link. If you reload or leave the browser session, you will need to select your local file again." },
  { question: "How long does processing take?", answer: "Processing time varies by video and service availability. There is no fixed completion time. Your project’s processing screen shows its current status." },
  { question: "What videos work best?", answer: "Choose a recording with clear speech or distinct moments, such as a podcast, interview, gaming video, or coaching session. Results vary; review the suggested clips to decide what fits your audience." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="faq-section page-width" aria-labelledby="faq-heading">
      <h2 id="faq-heading">FAQ</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return <div key={faq.question} className="faq-item">
            <h3><button type="button" id={`faq-question-${index}`} aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(isOpen ? null : index)}>
              {faq.question}<ChevronDown size={20} aria-hidden="true" className={isOpen ? "faq-chevron is-open" : "faq-chevron"} />
            </button></h3>
            <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={!isOpen}>
              <p>{faq.answer}</p>
            </div>
          </div>;
        })}
      </div>
    </section>
  );
}
