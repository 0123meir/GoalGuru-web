import Like from "../db/likeSchema";

export async function addLike(userId: string, postId: string) {
  try {
    const newLike = new Like({
      userId,
      postId,
    });

    return await newLike.save();
  } catch (err) {
    console.error("Post saving error: ", err);
  }
}

export async function findLike(userId: string, postId: string) {
  return await Like.findOne({ postId, userId });
}
export async function removeLike(userId: string, postId: string) {
  return await Like.deleteOne({ postId, userId });
}
