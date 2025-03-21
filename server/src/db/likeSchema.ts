import { Schema, model, Document } from "mongoose";

export interface ILike extends Document {
  userId: Schema.Types.ObjectId;
  postId: Schema.Types.ObjectId;
}

const likeSchema = new Schema<ILike>({
  userId: { type: Schema.Types.ObjectId,ref: "User", required: true },
  postId: { type: Schema.Types.ObjectId,ref: "Post", required: true },
});

const Like = model<ILike>("Like", likeSchema);

export default Like;
