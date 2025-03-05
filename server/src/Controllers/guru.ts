import express, { Request, Response } from "express";
import authenticate from "../Middlewares/authMiddleware";
import { saveGoal } from "../DAL/goals";
import { getStepsByGoalId, saveStep } from "../DAL/steps";
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
      const { prompt } = req.body;
      const creatorId = req["user"]._id;

      if (!prompt.trim()) return;
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        store: true,
        messages: [
          {
            role: "user",
            content: `My goal is to ${prompt}. Generate a JSON object representing my goal. The response format should be:
            {
              "name": "A short goal name",
              "steps": ["Step 1", "Step 2", "Step 3",...]
            }

            The steps should be achievable with a clear DOD
            Ensure the response is valid JSON.`,
          },
        ],
        max_tokens: 200,
        response_format: { type: "json_object" },
      });

      const parsedTodos = JSON.parse(response.choices[0].message.content);
      const name = parsedTodos.name;
      const steps = parsedTodos.steps;
      const goal = await saveGoal({ name, creatorId } as IGoal);
      await Promise.all(
        steps.map(
          async (step) =>
            await saveStep({
              description: step,
              completed: false,
              goal: goal._id,
            } as IStep),
        ),
      );
      const stepsResponse = await getStepsByGoalId(goal._id as string);
      res.json({ steps: stepsResponse, name: name });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.name });
      return;
    }
  },
);

export default router;
