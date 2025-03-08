import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  description: string;
  posterId: mongoose.Schema.Types.ObjectId;
  publishTime: Date;
  imageUrls?: string[];
}

const postSchema: Schema<IPost> = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  publishTime: {
    type: Date,
    default: Date.now,
  },
  imageUrls: {
    type: [String],
  },
});

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;