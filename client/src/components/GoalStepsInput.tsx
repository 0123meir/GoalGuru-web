import { useStepApi } from "@/hooks/useStepApi";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

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
    <div className="flex space-x-2 mt-3">
      <input
        type="text"
        value={newStep}
        onChange={(e) => setNewStep(e.target.value)}
        placeholder="New Step"
        className="flex-1 p-2 border rounded focus:outline-blue-500"
      />
      <button
        onClick={handleAddStep}
        className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-3 py-2 rounded hover:bg-green-600 transition"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default GoalStepsInput;
