import { useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRegCircle,
  FaTrash,
} from "react-icons/fa";

import { useGoalApi } from "@/hooks/useGoalApi";

import { Goal, Step } from "@/types/goals";

import GoalStep from "./GoalStep";
import GoalStepsInput from "./GoalStepsInput";

type GoalItemProps = {
  goal: Goal;
};

const GoalItem: React.FC<GoalItemProps> = ({ goal }) => {
  const [expanded, setExpanded] = useState(false);
  const { deleteGoal, updateGoal } = useGoalApi();

  return (
    <div className="mb-4 p-4 border rounded-xl shadow-sm bg-gray-50">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateGoal(goal.id, { ...goal, completed: !goal.completed });
            }}
          >
            {goal.completed ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaRegCircle />
            )}
          </button>
          <h3
            className={`text-lg font-semibold ${
              goal.completed ? "line-through text-gray-500" : "text-gray-800"
            }`}
          >
            {goal.name}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteGoal(goal.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2">
          {goal.steps.length === 0 ? (
            <p className="text-sm text-gray-400">No steps added.</p>
          ) : (
            goal.steps.map((step: Step) => (
              <GoalStep key={step.id} step={step} goalId={goal.id} />
            ))
          )}
          <GoalStepsInput goalId={goal.id} />
        </div>
      )}
    </div>
  );
};

export default GoalItem;
