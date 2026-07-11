import Hero from "../components/Hero";
import InputSection from "../components/InputSection";

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
    </div>
  );
};

export default LandingPage;
