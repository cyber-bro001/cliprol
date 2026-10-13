import Hero from "../components/Hero";
import InputSection from "../components/InputSection";
import HeroTransformation from "../components/landing/HeroTransformation";
import WhyCliprol from "../components/WhyCliprol";
import HowItWorks from "../components/HowItWorks";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import FinalCTA from "../components/FinalCTA";
import { useSectionEntrances } from "../components/landing/useSectionEntrances";

export default function LandingPage() {
  useSectionEntrances();
  return (
    <>
      <main id="main">
        <section className="hero" aria-label="Find moments in your video">
          <Hero />
          <InputSection />
          <HeroTransformation />
        </section>
        <WhyCliprol />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
