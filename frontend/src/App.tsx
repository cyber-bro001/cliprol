import { useState } from "react";

import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import ResultsPage from "./pages/ResultsPage";

const App = () => {
  const [page, setPage] = useState<"landing" | "processing" | "results">(
    "landing",
  );
  const [clips, setClips] = useState<string[]>([]);
  
  return (
    <div>
      <Header />
      {page === "landing" && <LandingPage setPage={setPage} setClips={setClips} />}
      {page === "processing" && <ProcessingPage />}
      {page === "results" && <ResultsPage />}
    </div>
  );
};

export default App;
