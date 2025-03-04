import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authenticate from "../Middlewares/authMiddleware";
import {
  saveGoal,
  getAllGoals,
  getGoalById,
  getGoalsByCreatorId,
  updateGoalById,
} from "../DAL/goals";

const router = express.Router();

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, steps } = req.body;
      const creatorId = req["user"]._id;

      if (!name || !creatorId || !steps) {
        res.status(400).json("required body not provided");
        return;
      }

      if (
        typeof name !== "string" ||
        !mongoose.Types.ObjectId.isValid(creatorId) ||
        !Array.isArray(steps)
      ) {
        res.status(400).json("wrong type in one of the body parameters");
        return;
      }

      const addedGoal = await saveGoal({...req.body, creatorId});

      res.json({ message: "goal saved successfully", goal: addedGoal });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.name });
      return;
    }
  },
);

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const goals = await getAllGoals();
      res.json(goals);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.name });
      return;
    }
  },
);

router.get(
  "/sender",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const creatorId = req["user"]._id;

      const goals = await getGoalsByCreatorId(creatorId);
      res.json(goals);
      return;
    } catch (err) {
      res.status(500).json({ error: err.name });
      return;
    }
  },
);

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const goalId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(goalId)) {
        res.status(400).json({ error: "Invalid goal ID" });
        return;
      }
      const goal = await getGoalById(goalId);

      if (!goal) {
        res.status(404).json({ error: "Goal not found" });
        return;
      }

      res.json(goal);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.name });
      return;
    }
  },
);

router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const goalId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(goalId)) {
        res.status(400).json({ error: "Invalid goal ID" });
        return;
      }
      const { name, steps } = req.body;
      if (!name || !steps) {
        res.status(400).json("required body not provided");
        return;
      }
      if (typeof name !== "string") {
        res.status(400).json("wrong type body parameters");
        return;
      }

      const updatedGoal = await updateGoalById(goalId, name);
      if (!updatedGoal) {
        res.status(404).json({
          error: "Goal not found",
        });
        return;
      }
      res.json(updatedGoal);
      return;
    } catch (err) {
      res.status(500).json({ error: err.name });
      return;
    }
  },
);

export default router;
