import Hero from "../components/Hero";
import PreviewFrame from "../components/PreviewFrame";
import InputSection from "../components/InputSection";
import WhyCliprol from "../components/WhyCliprol";
import HowItWorks from "../components/HowItWorks";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <InputSection />
      <PreviewFrame
        title="Cliprol in action"
        description="Soon you'll see the complete workflow from upload to finished clips."
      />
      <WhyCliprol />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
