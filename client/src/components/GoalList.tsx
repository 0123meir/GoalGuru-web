import { useGoalApi } from "@/hooks/useGoalApi";
import { useEffect } from "react";

import useGoalStore from "../store/useGoalStore";
import GoalInput from "./GoalInput";
import GoalItem from "./GoalItem";

const GoalList = () => {
  const { goals } = useGoalStore();

  const { getAllGoals } = useGoalApi();

  useEffect(() => {
    getAllGoals();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg flex-1 flex flex-col max-w-max">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        My Goals
      </h2>
      <GoalInput />
      <div className="overflow-y-auto space-y-4 grow">
        {goals.length === 0 ? (
          <p className="text-center text-gray-500">No goals yet. Add one!</p>
        ) : (
          goals.map((goal) => <GoalItem key={goal.id} goal={goal} />)
        )}
      </div>
    </div>
  );
};

export default GoalList;
