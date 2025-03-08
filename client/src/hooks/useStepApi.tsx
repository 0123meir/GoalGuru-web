import useApiRequest from "@/hooks/useApiRequests";
import { Goal, Step } from "@/types/goals";
import useGoalStore from "@/store/useGoalStore";
import { StepDTO } from "@/types/dtos";

export const useStepApi =() => {
  const {goals, setGoals, addStep: createStep} = useGoalStore();
  const api = useApiRequest();

  const addStep = async (goalId: string, description: string) => {
      try {
        const response = await api.post("/steps",
          {
            goalId: goalId, 
            description: description,
            completed: false
        });

        const step: StepDTO = response.data.step;
        createStep(step._id, step.goal as string ,step.description)
    } catch (error) {
        console.error("Failed to add step", error);
      }
    }

  const updateStep = async (id: string, updates: Step) => {
      try {
        const response = await api.put(`/steps/${id}`, {description: updates.description, completed: updates.completed});
        
        setGoals(goals.map((goal: Goal) => (goal.id === response.data.goal._id ? ({...goal, steps: goal.steps.map((step) =>
            step.id === response.data._id ? response.data : step
          )}) as Goal : goal)));      
        } catch (error) {
        console.error("Failed to update step", error);
      }
    }

  const deleteStep = async (id: string) => {
      try {
        await api.delete(`/steps/${id}`);
        setGoals(goals.map((goal: Goal) => (({...goal, steps: goal.steps.filter((step) =>
            step.id !== id
          )}) as Goal)))
        } catch (error) {
        console.error("Failed to delete step", error);
      }
    }

  return { addStep, updateStep, deleteStep };
}
