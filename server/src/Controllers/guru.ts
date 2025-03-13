import express, { Request, Response } from "express";
import authenticate from "../Middlewares/authMiddleware";
import { saveGoal, getGoalById, updateGoalById } from "../DAL/goals";
import { getStepsByGoalId, saveStep, updateStepById } from "../DAL/steps";
import OpenAI from "openai";
import { IStep } from "../db/stepSchema";
import { IGoal } from "../db/goalSchema";

const router = express.Router();
const openai = new OpenAI();

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, goalId, history } = req.body;
      const creatorId = req["user"]._id;

      if (!prompt.trim()) return;

      let goal = null;
      let steps = [];

      if (goalId) {
        // Fetch the existing goal and its steps
        goal = await getGoalById(goalId);
        if (!goal) {
          res.status(404).json({ error: "Goal not found" });
          return;
        }
        steps = await getStepsByGoalId(goalId);
      }

      // Construct the conversation history
      const messages = [
        {
          role: "system",
          content: "You are an assistant helping users refine their goals and steps.",
        },
        ...(history || []),
        {
          role: "user",
          content: `Update the goal based on: "${prompt}". The current goal is: ${
            goal ? goal.name : "None"
          }. The current steps are: ${steps.map((s) => s.description).join(", ")}.

          Update the goal name and steps as needed and return a friendly message to the user. Return a JSON object:
          {
            "name": "Updated goal name",
            "steps": ["Updated Step 1", "Updated Step 2", "Updated Step 3", ...],
            "message": "I updated your goal..."
          }
          `,
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content);
      const updatedName = parsedResponse.name;
      const updatedSteps = parsedResponse.steps;
      const message = parsedResponse.message;

      if (goal) {
        await updateGoalById(goalId, updatedName, false);

        // Update existing steps or add new ones
        await Promise.all(
          updatedSteps.map(async (step, index) => {
            if (steps[index]) {
              await updateStepById(steps[index]._id, step, false);
            } else {
              await saveStep({
                description: step,
                completed: false,
                goal: goalId,
              } as IStep);
            }
          }),
        );
      } else {
        // Create a new goal if goalId is not provided
        goal = await saveGoal({ name: updatedName, creatorId, completed: false } as IGoal);
        await Promise.all(
          updatedSteps.map(async (step) => {
            await saveStep({
              description: step,
              completed: false,
              goal: goal._id,
            } as IStep);
          }),
        );
      }

      const updatedStepsResponse = await getStepsByGoalId(goal._id as string);
      res.json({ steps: updatedStepsResponse, name: updatedName, _id: goal.id, message: message });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.name });
      return;
    }
  },
);

export default router;
