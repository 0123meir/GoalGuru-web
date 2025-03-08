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
    return await Goal.findById(id).populate("steps").exec();
  } catch (err) {
    console.error("Goals retrieving failed: ", err);
  }
};

const getAllGoals = async () => {
  try {
    return await Goal.find().populate("steps").exec();;
  } catch (err) {
    console.error("Goals retrieving failed: ", err);
  }
};

const updateGoalById = async (id: string, name: string, completed: boolean) => {
  return await Goal.findByIdAndUpdate(id, { name, completed }, { new: true }).populate("steps").exec();;
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
    return await Goal.find({ creatorId }).populate("steps").exec();;
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
