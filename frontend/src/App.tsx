import Header from "./components/Header";
import { useCliprolContext } from "./context/CliprolContext";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import ResultsPage from "./pages/ResultsPage";

const App = () => {
  const {page} = useCliprolContext();
 
  return (
    <div>
      <Header />
      {page === "landing" && <LandingPage />}
      {page === "processing" && <ProcessingPage />}
      {page === "results" && <ResultsPage />}
    </div>
  );
};

export default App;
