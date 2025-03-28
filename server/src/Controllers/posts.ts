import express, { Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

import authenticate, {
  AuthenticatedRequest,
} from "../Middlewares/authMiddleware";
import {
  savePost,
  getRecentPosts,
  getPostsById,
  getPostsByPosterId,
  updatePostById,
  deletePostById,
} from "../DAL/posts";
import Post from "../db/postSchema";
import { getUserById } from "../DAL/users";
import { formatPostImage, formatProfileImage, postImagesDirectory, profileImagesDirectory } from "../config/config";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return callback(null, true);
    }
    callback(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

router.post(
  "/",
  authenticate,
  upload.array("images", 4), // Allow up to 4 images
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { description } = req.body;
      const posterId = req.user.id;

      if (!description) {
        res.status(400).json({ error: "Required body not provided" });
        return;
      }
      if (typeof description !== "string") {
        res
          .status(400)
          .json({ error: "Wrong type in one of the body parameters" });
        return;
      }

      let imageUrls: string[] = [];
      if (req.files) {
        for (const file of req.files as Express.Multer.File[]) {
          const imagePath = path.join(
            postImagesDirectory,
            `${Date.now()}-${file.originalname}`
          );
          await sharp(file.buffer)
            .resize(800, 800, { fit: "inside" })
            .toFile(imagePath);
          imageUrls.push(imagePath);
        }
      }
      const post = new Post({
        posterId,
        publishTime: Date.now(),
        description,
        imageUrls,
      });
      const addedPost = (await savePost(post)).toObject();
      const user = await getUserById(posterId);
      res.json({
        message: "Post saved successfully",
        post: {
          ...addedPost,
          poster: {
            username: user.username,
            profileImage: formatProfileImage(user.profileImage),
          },
          imageUrls: imageUrls.map((url) => formatPostImage(url)) ?? null,
          likesCount: 0,
          comments: [],
        },
      });
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
      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1; // Default to page 1
      const limit = parseInt(req.query.limit as string) || 10; // Default to 10 posts per page
      const skip = (page - 1) * limit;

      // Get the paginated posts
      const posts = await getRecentPosts(req.user.id, skip, limit);

      // Map and format the posts
      for (const post of posts) {
        post.imageUrls = post.imageUrls.map(formatPostImage);
        if (post.poster.profileImage) {
          post.poster.profileImage = formatProfileImage(post.poster.profileImage);
        }
      }

      const hasMore = posts.length === limit;

      // Send paginated posts as response
      res.status(200).json({
        page,
        limit,
        posts,
        hasMore
      });
      return;
    } catch (err) {
      console.error("Error fetching recent posts:", err);
      res.status(500).json({ error: "Failed to fetch recent posts", details: err.message });
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
      res.status(500).json({
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
  upload.array("images", 4), // Allow up to 4 images in update
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      // Get the existing post
      const existingPost = await getPostsById(postId);
      if (!existingPost) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Check if user is authorized to update this post
      if (existingPost.posterId.toString() !== req.user.id) {
        res.status(403).json({ error: "Unauthorized to update this post" });
        return;
      }

      // Parse the existing images the user wants to keep
      let keepExistingImages: string[] = [];
      if (req.body.existingImages) {
        try {
          keepExistingImages = JSON.parse(req.body.existingImages);
        } catch (err) {
          console.error("Error parsing existingImages:", err);
          res.status(400).json({ error: "Invalid existingImages format" });
          return;
        }
      }

      // Determine which images to delete
      const imagesToDelete = existingPost.imageUrls.filter(
        url => !keepExistingImages.includes(url)
      );

      // Delete images that were removed
      for (const imageUrl of imagesToDelete) {
        try {
          if (fs.existsSync(imageUrl)) {
            fs.unlinkSync(imageUrl);
          }
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      }

      // Process new uploaded images
      let newImageUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files as Express.Multer.File[]) {
          const imagePath = path.join(
            postImagesDirectory,
            `${Date.now()}-${file.originalname}`
          );
          await sharp(file.buffer)
            .resize(800, 800, { fit: "inside" })
            .toFile(imagePath);
          newImageUrls.push(imagePath);
        }
      }

      // Combine kept existing images with new images
      const imageUrls = [...keepExistingImages, ...newImageUrls];

      // Update the post in database
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          description,
          imageUrls
        },
        { new: true }
      );

      const user = await getUserById(req.user.id);
      
      // Format the response
      const formattedPost = {
        ...updatedPost.toObject(),
        poster: {
          username: user.username,
          profileImage: formatProfileImage(user.profileImage)
        },
        imageUrls: updatedPost.imageUrls.map(url => formatPostImage(url)) || [],
      };

      res.json({
        message: "Post updated successfully",
        post: formattedPost
      });
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

router.delete(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      if (post.posterId.toString() !== req.user.id) {
        res.status(403).json({ error: "Unauthorized to delete this post" });
        return;
      }

      await deletePostById(postId);

      res.status(200).json({ message: "Post deleted successfully" });
      return;
    } catch (err) {
      console.error("Error deleting post by ID:", err);
      res
        .status(500)
        .json({ error: "Failed to delete post by ID", details: err.message });
      return;
    }
  }
);

export default router;
