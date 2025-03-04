import mongoose, { Document, Query, Schema } from "mongoose";
import { IGoal } from "./goalSchema";

export interface IStep extends Document {
  description: string;
  completed: boolean;
  goal: mongoose.Schema.Types.ObjectId | IGoal;
}

const stepSchema: Schema<IStep> = new mongoose.Schema({
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true,
  },
});


stepSchema.pre<Query<any, IStep>>(/^find/, function (next) {
  this.populate({
    path: "goal"
  });
  next();
});

const Step = mongoose.model<IStep>("Step", stepSchema);

export default Step;
