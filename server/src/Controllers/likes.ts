import express, { Request, Response } from "express";
import { addLike, removeLike } from "../DAL/likes";
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
      const like = await addLike(userId, postId);
      res.status(201).json({ message: `Like added successfully: ${like}` });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
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
      await removeLike(userId, postId);
      res.status(200).json({ message: "Like deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;
