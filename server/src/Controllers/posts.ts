import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authenticate, {
  AuthenticatedRequest,
} from "../Middlewares/authMiddleware";
import {
  savePost,
  getRecentPosts,
  getPostsById,
  getPostsByPosterId,
  updatePostById,
} from "../DAL/posts";

const router = express.Router();

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { description, posterId } = req.body;

      if (!description || !posterId) {
        res.status(400).json({ error: "Required body not provided" });
        return;
      }
      if (
        typeof description !== "string" ||
        !mongoose.Types.ObjectId.isValid(posterId)
      ) {
        res
          .status(400)
          .json({ error: "Wrong type in one of the body parameters" });
        return;
      }

      const addedPost = await savePost(req.body);

      res.json({ message: "Post saved successfully", post: addedPost });
      return;
    } catch (error) {
      console.error("Error saving post:", error);
      res
        .status(500)
        .json({ error: "Failed to save post", details: error.message });
      return;
    }
  }
);

router.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const posts = await getRecentPosts(req.user.id);

      res.status(200).json(posts);
      return;
    } catch (err) {
      console.error("Error fetching recent posts:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch recent posts", details: err.message });
      return;
    }
  }
);

router.get(
  "/poster",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const posterId = req.query.id as string;
      if (!posterId) {
        res.status(404).json({ error: "PosterId not provided" });
        return;
      }

      const posts = await getPostsByPosterId(posterId);
      res.json(posts);
      return;
    } catch (err) {
      console.error("Error fetching posts by poster ID:", err);
      res
        .status(500)
        .json({
          error: "Failed to fetch posts by poster ID",
          details: err.message,
        });
      return;
    }
  }
);

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }
      const post = await getPostsById(postId);

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
      return;
    } catch (err) {
      console.error("Error fetching post by ID:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch post by ID", details: err.message });
      return;
    }
  }
);

router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }
      const { description } = req.body;
      if (!description) {
        res.status(400).json({ error: "Required body not provided" });
        return;
      }
      if (typeof description !== "string") {
        res.status(400).json({ error: "Wrong type body parameters" });
        return;
      }

      const updatedPost = await updatePostById(postId, description);
      if (!updatedPost) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      res.json(updatedPost);
      return;
    } catch (err) {
      console.error("Error updating post by ID:", err);
      res
        .status(500)
        .json({ error: "Failed to update post by ID", details: err.message });
      return;
    }
  }
);

export default router;
