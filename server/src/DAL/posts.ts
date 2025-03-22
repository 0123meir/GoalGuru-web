import Post, { IPost } from "../db/postSchema";
import { ObjectId } from "mongodb";

const savePost = async (post) => {
  try {
    return await post.save();
  } catch (err) {
    console.error("Post saving error: ", err);
  }
};

const getRecentPosts = async (userId: string) => {
  try {
    return await Post.aggregate([
      // 1. Sort by publishTime (newest first) and limit to 10 posts
      { $sort: { publishTime: -1 } },
      { $limit: 10 },

      // 2. Lookup the poster's user info to get the username
      {
        $lookup: {
          from: "users",
          localField: "posterId",
          foreignField: "_id",
          as: "poster",
        },
      },
      { $unwind: "$poster" },

      // 3. Lookup likes for each post to count them
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },

      // 4. Lookup comments for each post
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },

      // 5. Lookup users for the commentors (to later extract their username)
      {
        $lookup: {
          from: "users",
          localField: "comments.commentorId",
          foreignField: "_id",
          as: "commentUsers",
        },
      },
      // 6. Compute isLikedByUser: true if currentUserId exists in the likes array
      {
        $addFields: {
          isLikedByUser: {
            $in: [new ObjectId(userId), "$likes.userId"],
          },
        },
      },
      // 7. Project the fields needed with the commentor's username only
      {
        $project: {
          description: 1,
          publishTime: 1,
          imageUrls: 1,
          "poster.username": 1,
          "poster._id": 1,
          "poster.profileImage": 1,
          likesCount: { $size: "$likes" },
          isLikedByUser: 1,
          comments: {
            $map: {
              input: "$comments",
              as: "c",
              in: {
                content: "$$c.content",
                username: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$commentUsers",
                            as: "cu",
                            cond: { $eq: ["$$cu._id", "$$c.commentorId"] },
                          },
                        },
                        as: "matchedUser",
                        in: "$$matchedUser.username",
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
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

const deletePostById = async (id: string) => {
  try {
    return await Post.findByIdAndDelete(id);
  } catch (err) {
    console.error("Post deletion failed: ", err);
  }
};

export {
  savePost,
  getRecentPosts,
  getPostsById,
  getPostsByPosterId,
  updatePostById,
  deletePostById
};
