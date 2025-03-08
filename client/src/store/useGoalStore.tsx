import { Goal, Step } from "@/types/goals";
import { create } from "zustand";

interface GoalStore {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  addGoal: (id: string, name: string, steps: Step[]) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  addStep: (id: string, goalId: string, description: string) => void;
  toggleStep: (goalId: string, stepId: string) => void;
  editStep: (goalId: string, stepId: string, newText: string) => void;
  deleteStep: (goalId: string, stepId: string) => void;
  reorderGoals: (startIndex: number, endIndex: number) => void;
}

const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  setGoals: (goals: Goal[]) => set({goals}),
  addGoal: (id, name, steps= []) =>
    set((state) => ({
      goals: [...state.goals, { id, name, completed: false, steps: steps }],
    })),

  removeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    })),

  toggleGoal: (id) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      ),
    })),

  addStep: (id, goalId, description) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              steps: [...goal.steps, { id, description, completed: false }],
            }
          : goal
      ),
    })),

  toggleStep: (goalId, stepId) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              steps: goal.steps.map((step) =>
                step.id === stepId ? { ...step, completed: !step.completed } : step
              ),
            }
          : goal
      ),
    })),

  editStep: (goalId, stepId, newText) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              steps: goal.steps.map((step) =>
                step.id === stepId ? { ...step, text: newText } : step
              ),
            }
          : goal
      ),
    })),

  deleteStep: (goalId, stepId) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              steps: goal.steps.filter((step) => step.id !== stepId),
            }
          : goal
      ),
    })),
    reorderGoals: (startIndex: number, endIndex: number) => set((state) => {
        const reorderedGoals = Array.from(state.goals);
        const [removed] = reorderedGoals.splice(startIndex, 1);
        reorderedGoals.splice(endIndex, 0, removed);
        return { goals: reorderedGoals };
    }),
}
));

export default useGoalStore;
