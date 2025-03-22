import express, { Response } from "express";
import { addLike, findLike, removeLike } from "../DAL/likes";
import authenticate, {
  AuthenticatedRequest,
} from "../Middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const { postId } = req.body;
    const userId = req.user.id;

    try {
      const existingLike = await findLike(userId, postId);

      if (existingLike) {
        res.status(400).json({ error: "Failed to add like" });
        return;
      }

      const like = await addLike(userId, postId);
      res.status(201).json({ message: "Like added successfully", like });
      return;
    } catch (error) {
      console.error("Error adding like:", error);
      res
        .status(500)
        .json({ error: "Failed to add like", details: error.message });
      return;
    }
  }
);

router.delete(
  "/:postId",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
      const like = await findLike(userId, postId);

      if (!like) {
        res.status(404).json({ error: "Failed to delete like" });
        return;
      }

      await removeLike(userId, postId);
      res.status(200).json({ message: "Like deleted successfully" });
      return;
    } catch (error) {
      console.error("Error deleting like:", error);
      res
        .status(500)
        .json({ error: "Failed to delete like", details: error.message });
      return;
    }
  }
);

export default router;
