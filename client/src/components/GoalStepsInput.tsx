import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { useStepApi } from "@/hooks/useStepApi";

type GoalStepsInputProps = {
  goalId: string;
};

const GoalStepsInput: React.FC<GoalStepsInputProps> = ({ goalId }) => {
  const [newStep, setNewStep] = useState("");
  const { addStep } = useStepApi();
  const handleAddStep = () => {
    if (newStep.trim()) {
      addStep(goalId, newStep);
      setNewStep("");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={newStep}
        onChange={(e) => setNewStep(e.target.value)}
        placeholder="New Step"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddStep();
          }
        }}
        className="pl-4 py-2 border focus:outline-blue-500 rounded-full grow"
      />
      <button
        onClick={handleAddStep}
        className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-3 py-2 rounded-full"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default GoalStepsInput;
