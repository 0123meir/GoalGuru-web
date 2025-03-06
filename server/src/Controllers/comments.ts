import express, { Response } from "express";
import mongoose from "mongoose";
import {
  saveComment,
  getCommentById,
  getAllComments,
  updateCommentById,
  deleteCommentById,
  getCommentsByPostId,
} from "../DAL/comments";
import { getPostsById } from "../DAL/posts";
import authenticate, {
  AuthenticatedRequest,
} from "../Middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { content, postId } = req.body;
      const userId = req.user.id;
      if (!content || !postId) {
        res.status(400).json({ error: "Required body not provided" });
        return;
      }
      if (
        typeof content !== "string" ||
        !mongoose.Types.ObjectId.isValid(postId)
      ) {
        res
          .status(400)
          .json({ error: "Wrong type in one of the body parameters" });
        return;
      }

      const post = await getPostsById(postId);
      if (!post) {
        res.status(400).json({ error: "Post does not exist" });
        return;
      }

      const addedComment = await saveComment({
        content,
        postId,
        commentorId: userId,
      });

      res.json({
        message: "Comment saved successfully",
        comment: addedComment,
      });
      return;
    } catch (error) {
      console.error("Error saving comment:", error);
      res
        .status(500)
        .json({ error: "Failed to save comment", details: error.message });
      return;
    }
  }
);

router.get(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const comment = await getCommentById(req.params.id);

      if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }

      res.json(comment);
      return;
    } catch (err) {
      console.error("Error fetching comment by ID:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch comment by ID", details: err.message });
      return;
    }
  }
);

router.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const comments = await getAllComments();
      res.json(comments);
      return;
    } catch (err) {
      console.error("Error fetching all comments:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch all comments", details: err.message });
      return;
    }
  }
);

router.put(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const newContent = req.body.content;
      if (!newContent) {
        res.status(400).json({ error: "Required body not provided" });
        return;
      }
      if (typeof newContent !== "string") {
        res.status(400).json({ error: "Wrong type body parameters" });
        return;
      }

      const updatedComment = await updateCommentById(req.params.id, newContent);
      if (!updatedComment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      res.json(updatedComment);
      return;
    } catch (err) {
      console.error("Error updating comment by ID:", err);
      res
        .status(500)
        .json({
          error: "Failed to update comment by ID",
          details: err.message,
        });
      return;
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid comment ID" });
        return;
      }

      const deletedComment = await deleteCommentById(id);

      if (!deletedComment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }

      res.json({
        message: "Comment deleted successfully",
        deletedComment,
      });
      return;
    } catch (err) {
      console.error("Error deleting comment by ID:", err);
      res
        .status(500)
        .json({ error: "Failed to delete comment", details: err.message });
      return;
    }
  }
);

router.get(
  "/post/:postId",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }

      const post = await getPostsById(postId);
      if (!post) {
        res.status(404).json({ error: "Post does not exist" });
        return;
      }

      const comments = await getCommentsByPostId(postId);
      if (!comments || comments.length === 0) {
        res.status(404).json({ error: "No comments found for this post" });
        return;
      }

      res.json(comments);
      return;
    } catch (err) {
      console.error("Error fetching comments by post ID:", err);
      res
        .status(500)
        .json({
          error: "Failed to fetch comments by post ID",
          details: err.message,
        });
      return;
    }
  }
);

export default router;
