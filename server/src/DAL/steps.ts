import Step, { IStep } from "../db/stepSchema";
import Goal, { IGoal } from "../db/goalSchema";

const saveStep = async (step: IStep) => {
  const newStep = new Step(step);
  try {
    return await newStep.save();
  } catch (err) {
    console.error("Step saving error: ", err);
  }
};

const getStepById = async (id: string) => {
  try {
    return await Step.findById(id);
  } catch (err) {
    console.error("Steps retrieving failed: ", err);
  }
};

const updateStepById = async (id: string, description: string, completed) => {
  return await Step.findByIdAndUpdate(id, { description, completed }, { new: true });
};

const deleteStepById = async (step: IStep) => {
  try {
    const goal = step.goal as IGoal;
    await Goal.findByIdAndUpdate(goal.id, { $pull: { steps: step.id } });
    const deletedStep = await Step.findByIdAndDelete(step.id);

    return deletedStep;
  } catch (err) {
    console.error("Step deletion failed: ", err.message);
    throw err;
  }
};

const getStepsByGoalId = async (goalId: string) => {
  try {
    return await Step.find({ goal: goalId });
  } catch (err) {
    console.error("Error retrieving steps by goalId: ", err);
  }
};


const updateStepsByGoalId = async (goalId: string, completed: boolean) => {
  try 
  {
    await Step.updateMany({ goal: goalId }, { completed });
  } catch (err) 
  {
    console.error("Error updating steps by goalId: ", err)
  }
}

export {
  saveStep,
  getStepById,
  updateStepById,
  deleteStepById,
  getStepsByGoalId,
  updateStepsByGoalId
};
