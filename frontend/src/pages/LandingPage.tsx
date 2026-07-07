import Hero from "../components/Hero";
import InputSection from "../components/InputSection";

import type { PageType } from "../types";

type LandingPageProps = {
  setPage: (page: PageType) => void;
};

const LandingPage = (
  { setPage }: LandingPageProps,
  setClips: (clips: string[]) => void,
) => {
  return (
    <div>
      <Hero />
      <InputSection setPage={setPage} />
    </div>
  );
};

export default LandingPage;
