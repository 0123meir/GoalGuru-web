import Post, { IPost } from "../db/postSchema";
import { ObjectId } from "mongodb";

const savePost = async (post: IPost) => {
  const newPost = new Post(post);
  try {
    return await newPost.save();
  } catch (err) {
    console.error("Post saving error: ", err);
  }
};

const getRecentPosts = async (userId: string) => {
  try {
    return await Post.aggregate([
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          likesCount: {
            $size: "$likes",
          },
          isLikedByUser: {
            $anyElementTrue: {
              $map: {
                input: "$likes",
                as: "like",
                in: {
                  $eq: [
                    "$$like.userId",
                    new ObjectId(userId),
                  ],
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          createdAt: 1,
          likesCount: 1,
          isLikedByUser: 1,
          comments: 1,
        },
      },
    ]);
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const getPostsById = async (id: string) => {
  try {
    return await Post.findById(id);
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const getPostsByPosterId = async (posterId: string) => {
  try {
    return await Post.find({ posterId: posterId });
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const updatePostById = async (id: string, message: string) => {
  return await Post.findByIdAndUpdate(
    id,
    { description: message },
    {
      new: true,
    }
  );
};

export {
  savePost,
  getRecentPosts,
  getPostsById,
  getPostsByPosterId,
  updatePostById,
};
