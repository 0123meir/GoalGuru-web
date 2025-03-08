import mongoose, { Document, Query, Schema } from "mongoose";
import { IStep } from "./stepSchema";

export interface IGoal extends Document {
  name: string;
  completed: boolean;
  creatorId: mongoose.Schema.Types.ObjectId;
  steps: mongoose.Schema.Types.ObjectId[] | IStep[];
}

const goalSchema: Schema<IGoal> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

goalSchema.virtual("steps", {
  ref: "Step",
  localField: "_id",
  foreignField: "goal"
});

const Goal = mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;
