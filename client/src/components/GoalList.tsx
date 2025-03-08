import { useEffect } from "react";

import useGoalStore from "@/store/useGoalStore";

import { useGoalApi } from "@/hooks/useGoalApi";

import GoalInput from "./GoalInput";
import GoalItem from "./GoalItem";

const GoalList = () => {
  const { goals } = useGoalStore();

  const { getAllGoals } = useGoalApi();

  useEffect(() => {
    getAllGoals();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg flex flex-col w-1/3 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        My Goals
      </h2>
      <GoalInput />
      <div className="">
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
