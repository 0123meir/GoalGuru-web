import { useCallback } from "react";

import useGoalStore from "@/store/useGoalStore";

import useApiRequest from "@/hooks/useApiRequests";

import { GoalDTO } from "@/types/dtos";
import { Goal } from "@/types/goals";

export const useGoalApi = () => {
  const { goals, setGoals, removeGoal } = useGoalStore();
  const api = useApiRequest();

  const getAllGoals = async () => {
    try {
      const response = await api.get("goals/sender");
      setGoals(
        response.data.map((goal: GoalDTO) => {
          const parsedResponse = {
            ...goal,
            id: goal._id,
            steps: goal.steps.map((step) => ({ ...step, id: step._id })), //TODO: Convert all from dto everywhere
          };
          return parsedResponse;
        })
      );
    } catch (error) {
      console.error("Failed to fetch goals", error);
    }
  };

  const addGoal = useCallback(
    async (name: string, completed: boolean) => {
      try {
        const response = await api.post("/goals", {
          name: name,
          completed: completed,
        });
        setGoals([...goals, response.data.goal]);
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
