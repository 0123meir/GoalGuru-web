import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authenticate from "../Middlewares/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllUsers,
  deleteUserById,
  getUserById,
  updateUserById,
} from "../DAL/users";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../image_storage/profile_images");

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

interface User {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  tokens: string[];
  profileImage: string;
}

const extractUserProps = (user: User) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  tokens: user.tokens,
  profileImage: user.profileImage,
});

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await getAllUsers();
      res.json(users.map(extractUserProps));
      return;
    } catch (error) {
      console.error("Error fetching all users:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch users", details: error.message });
      return;
    }
  }
);

// Get a specific user by ID
router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Incorrect ID format" });
        return;
      }
      const user = await getUserById(id);

      if (!user) {
        res.status(404).json({
          error: "User not found",
        });
        return;
      }
      res.json(extractUserProps(user));
      return;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ error: "Server Error", details: error.message });
      return;
    }
  }
);

// Update a user by ID
router.put(
  "/:id",
  authenticate,
  upload.single("profileImage"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;
      const profileImage = req.file ? req.file.path : undefined;

      if (username === "" || email === "" || password === "") {
        res.status(400).json({ error: "Cannot update to empty fields" });
        return;
      }

      if (!id) {
        res.status(400).json({ error: "Missing required field: ID" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Incorrect ID format" });
        return;
      }
      const updatedUser = await updateUserById(
        id,
        username,
        email,
        password,
        profileImage
      ); 
      if (!updatedUser) {
        res.status(400).json({ error: "User not found" });
        return;
      }
      res.json(extractUserProps(updatedUser));
      return;
    } catch (error: any) {
      console.error("Error updating user by ID:", error);
      const statusCode =
        error.message === "Username already exists" ||
        error.message === "Email already exists"
          ? 400
          : 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
  }
);

// Delete a user by ID
router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Missing required field: ID" });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Incorrect ID format" });
        return;
      }
      const user = await deleteUserById(id);

      if (!user) {
        res.status(404).json({
          error: "User not found",
        });
        return;
      }
      res.json({
        message: "User deleted successfully",
        user: extractUserProps(user),
      });
      return;
    } catch (error) {
      console.error("Error deleting user by ID:", error);
      res
        .status(500)
        .json({ error: "Failed to delete user", details: error.message });
      return;
    }
  }
);

export default router;
