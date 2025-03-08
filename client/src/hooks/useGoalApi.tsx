import useApiRequest from "@/hooks/useApiRequests";
import useGoalStore from "@/store/useGoalStore";
import { GoalDTO } from "@/types/dtos";
import { Goal } from "@/types/goals";
import { useCallback } from "react";

export const useGoalApi = () => {
  const { goals, setGoals, removeGoal } = useGoalStore();
  const api = useApiRequest();

  const getAllGoals = useCallback(async () => {
    try {
      const response = await api.get("goals/sender");
      setGoals(
        response.data.map((goal: GoalDTO) => {
          const parsedResponse = {
            ...goal,
            id: goal._id,
            steps: goal.steps.map((step) => ({ ...step, id: step._id })),
          };
          return parsedResponse;
        })
      );
    } catch (error) {
      console.error("Failed to fetch goals", error);
    }
  }, [api, setGoals]);

  const addGoal = useCallback(
    async (goal: Goal) => {
      try {
        const response = await api.post("/goals", {
          body: JSON.stringify(goal),
        });
        setGoals([...goals, response.data]);
      } catch (error) {
        console.error("Failed to add goal", error);
      }
    },
    [api, goals, setGoals]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Goal) => {
      try {
        const updatedGoal = await api.put(`/goals/${id}`, {
          completed: updates.completed,
          name: updates.name,
        });
        setGoals(
          goals.map((goal) =>
            goal.id === id ? (updatedGoal.data as Goal) : goal
          )
        );
      } catch (error) {
        console.error("Failed to update goal", error);
      }
    },
    [api, goals, setGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/goals/${id}`);
        removeGoal(id);
      } catch (error) {
        console.error("Failed to delete goal", error);
      }
    },
    [api, removeGoal]
  );

  return { getAllGoals, addGoal, updateGoal, deleteGoal };
};
