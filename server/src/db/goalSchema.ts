import mongoose, { Document, Query, Schema } from "mongoose";
import { IStep } from "./stepSchema";

export interface IGoal extends Document {
  name: string;
  creatorId: mongoose.Schema.Types.ObjectId;
  steps: mongoose.Schema.Types.ObjectId[] | IStep[];
}

const goalSchema: Schema<IGoal> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

const Goal = mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;
