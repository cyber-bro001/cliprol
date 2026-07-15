import Hero from "../components/Hero";
import PreviewFrame from "../components/PreviewFrame";
import InputSection from "../components/InputSection";
import WhyCliprol from "../components/WhyCliprol";
import HowItWorks from "../components/HowItWorks";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

import type { PageType } from "../types";
import type {ClipsType} from "../types";

type LandingPageProps = {
  setPage: (page: PageType) => void;
  setClips: (clips: ClipsType) => void;
  setError: (error: string | null) => void;
  error: string | null;
};

const LandingPage = (
  { setPage, setClips, setError, error }: LandingPageProps
) => {
  return (
    <div>
      <Hero />
      <InputSection setPage={setPage} setClips={setClips} setError={setError} error={error} />
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
