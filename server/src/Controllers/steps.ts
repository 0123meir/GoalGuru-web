import express, { Request, Response } from "express";
import mongoose from "mongoose";
import {
  saveStep,
  getStepById,
  updateStepById,
  deleteStepById,
  getStepsByGoalId,
} from "../DAL/steps";
import { getGoalById } from "../DAL/goals";
import authenticate from "../Middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { description, completed, goalId } = req.body;
      if (!description || completed == undefined || !goalId) {
        res.status(400).json("required body not provided");
        return;
      }
      if (
        typeof description !== "string" ||
        typeof completed !== "boolean" ||
        !mongoose.Types.ObjectId.isValid(goalId)
      ) {
        res.status(400).json("wrong type in one of the body parameters");
        return;
      }

      const goal = await getGoalById(goalId);
      if (!goal) {
        res.status(404).json("goal does not exist");
        return;
      }

      const addedStep = await saveStep({...req.body, goal: goalId});

      res.json({
        message: "step saved successfully",
        step: addedStep,
      });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.step });
      return;
    }
  },
);

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const step = await getStepById(req.params.id);

      if (!step) {
        res.status(404).json({ error: "Step not found" });
        return;
      }

      res.json(step);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.step });
      return;
    }
  },
);

router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const newContent = req.body.content;
      if (!newContent) {
        res.status(400).json("required body not provided");
        return;
      }
      if (typeof newContent !== "string") {
        res.status(400).json("wrong type body parameters");
        return;
      }

      const updatedStep = await updateStepById(req.params.id, newContent);
      if (!updatedStep) {
        res.status(404).json({
          error: "Step not found",
        });
        return;
      }
      res.json(updatedStep);
      return;
    } catch (err) {
      res.status(500).json({ error: err.step });
      return;
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid step ID" });
        return;
      }

      const step = await getStepById(id);
      if (!step) {
        res.status(404).json({ error: "Step not found" });
        return;
      }
      
      const deletedStep = await deleteStepById(step);

      if (!deletedStep) {
        res.status(404).json({ error: "Step not found" });
        return;
      }

      res.json({
        message: "Step deleted successfully",
        deletedStep,
      });
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
      return;
    }
  },
);

router.get(
  "/goal/:goalId",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { goalId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(goalId)) {
        res.status(400).json({ error: "Invalid goal ID" });
        return;
      }

      const goal = await getGoalById(goalId);
      if (!goal) {
        res.status(404).json({
          error: "Goal does not exist",
        });
        return;
      }

      if (goal.creatorId.toString() !== req["user"]._id) {
        res.status(403).json({
            error: "Can't retrieve someone else's goal",
          });
        return;
      }

      const steps = await getStepsByGoalId(goalId);

      res.json(steps);
      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.step });
      return;
    }
  },
);

export default router;
