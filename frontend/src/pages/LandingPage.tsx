import Hero from "../components/Hero";
import InputSection from "../components/InputSection";

import type { PageType } from "../types";
import type {ClipsType} from "../types";

type LandingPageProps = {
  setPage: (page: PageType) => void;
  setClips: (clips: ClipsType) => void;
};

const LandingPage = (
  { setPage, setClips }
) => {
  return (
    <div>
      <Hero />
      <InputSection setPage={setPage} setClips={setClips} />
    </div>
  );
};

export default LandingPage;
