import Goal, { IGoal } from "../db/goalSchema";

const saveGoal = async (goal: IGoal) => {
  const newGoal = new Goal(goal);
  try {
    return await newGoal.save();
  } catch (err) {
    console.error("Goal saving error: ", err);
  }
};

const getGoalById = async (id: string) => {
  try {
    return await Goal.findById(id);
  } catch (err) {
    console.error("Goals retrieving failed: ", err);
  }
};

const getAllGoals = async () => {
  try {
    return await Goal.find();
  } catch (err) {
    console.error("Goals retrieving failed: ", err);
  }
};

const updateGoalById = async (id: string, name: string) => {
  return await Goal.findByIdAndUpdate(id, { name }, { new: true });
};

const deleteGoalById = async (id: string) => {
  try {
    return await Goal.findByIdAndDelete(id);
  } catch (err) {
    console.error("Goal deletion failed: ", err);
  }
};

const getGoalsByCreatorId = async (creatorId: string) => {
  try {
    return await Goal.find({ creatorId });
  } catch (err) {
    console.error("Error retrieving Goals by creatorId: ", err);
  }
};

export {
  saveGoal,
  getGoalById,
  getAllGoals,
  updateGoalById,
  deleteGoalById,
  getGoalsByCreatorId,
};
