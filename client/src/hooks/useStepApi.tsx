import useGoalStore from "@/store/useGoalStore";

import useApiRequest from "@/hooks/useApiRequests";

import { StepDTO } from "@/types/dtos";
import { Goal, Step } from "@/types/goals";

export const useStepApi = () => {
  const { goals, setGoals, addStep: createStep } = useGoalStore();
  const api = useApiRequest();

  const addStep = async (goalId: string, description: string) => {
    try {
      const response = await api.post("/steps", {
        goalId: goalId,
        description: description,
        completed: false,
      });

      const step: StepDTO = response.data.step;
      createStep(step._id, step.goal as string, step.description);
    } catch (error) {
      console.error("Failed to add step", error);
    }
  };

  const updateStep = async (id: string, goalId: string, updates: Step) => {
    try {
      await api.put(`/steps/${id}`, {
        description: updates.description,
        completed: updates.completed,
      });

      const newGoals = goals.map((goal: Goal) =>
        goal.id === goalId
          ? ({
              ...goal,
              steps: goal.steps.map((step) =>
                step.id === updates.id ? { ...updates, id: updates.id } : step
              ),
            } as Goal)
          : goal
      );
      setGoals(newGoals);
    } catch (error) {
      console.error("Failed to update step", error);
    }
  };

  const deleteStep = async (id: string) => {
    try {
      setGoals(
        goals.map(
          (goal: Goal) =>
            ({
              ...goal,
              steps: goal.steps.filter((step) => step.id !== id),
            } as Goal)
        )
      );
      await api.delete(`/steps/${id}`);
    } catch (error) {
      console.error("Failed to delete step", error);
    }
  };

  return { addStep, updateStep, deleteStep };
};
