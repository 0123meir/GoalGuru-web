import Step, { IStep } from "../db/stepSchema";
import Goal, { IGoal } from "../db/goalSchema";
import mongoose from "mongoose";

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

const updateStepById = async (id: string, content: string) => {
  return await Step.findByIdAndUpdate(id, { content }, { new: true });
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
    console.error("Error retrieving steps by postId: ", err);
  }
};

export {
  saveStep,
  getStepById,
  updateStepById,
  deleteStepById,
  getStepsByGoalId,
};
