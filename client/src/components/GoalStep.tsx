import { FaCheckCircle, FaRegCircle, FaTrash } from "react-icons/fa";

import { useStepApi } from "@/hooks/useStepApi";

type GoalStepProps = {
  step: { id: string; description: string; completed: boolean };
  goalId: string;
};

const GoalStep: React.FC<GoalStepProps> = ({ step }) => {
  const { deleteStep, updateStep } = useStepApi();

  return (
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md border">
      <button
        onClick={() =>
          updateStep(step.id, { ...step, completed: !step.completed })
        }
        className="text-blue-500"
      >
        {step.completed ? <FaCheckCircle /> : <FaRegCircle />}
      </button>
      <span className="flex-1 text-gray-700">{step.description}</span>
      <button
        onClick={() => deleteStep(step.id)}
        className="text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default GoalStep;
