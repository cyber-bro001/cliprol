import { useState } from "react";
import ProcessingState from "../components/ProcessingState";

const ProcessingPage = () => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  //const [loading, setLoading] = useState();
  //const [error, setError] = useState();

  return (
    <div className="">
      <ProcessingState currentStage={currentStage} />
    </div>
  );
};

export default ProcessingPage;
