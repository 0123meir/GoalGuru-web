import { config } from "dotenv";
config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testlikesdb";

import { connect, Types, ObjectId, connection } from "mongoose";
import request from "supertest";
import app from "../app";
import { Like, Post, User } from "../db/schemas";

let postId: ObjectId;
let userId: ObjectId;
let accessToken: string;
const mockUser = {
  name: "testuser",
  email: `testuser${Math.floor(Math.random() * 100000)}@example.com`,
  password: "password123",
};

const mockPost = {
  description: "This is a test post for testing comments",
  posterId: null as ObjectId | null,
};


beforeAll(async () => {
  await connect(process.env.DATABASE_URL);

  // Register a user
  const userRes = await request(app).post("/auth/register").send(mockUser);
  userId = userRes.body._id;
  
  // Create a post for testing likes
  mockPost.posterId = userId;
  const post = new Post(mockPost);
  const savedPost = await post.save();
  postId = savedPost._id as ObjectId
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);
  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();
  // Clean up existing likes before each test
  await Like.deleteMany({});
});

afterAll(async () => {
  await connection.db.dropDatabase();
  await connection.close();
});

describe("Testing Like Routes", () => {
  describe("POST /likes", () => {
    it("should add a like to a post", async () => {
      const res = await request(app)
        .post("/likes")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          postId: postId.toString()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Like added successfully");
      expect(res.body).toHaveProperty("like");
      expect(res.body.like).toHaveProperty("userId", userId.toString());
      expect(res.body.like).toHaveProperty("postId", postId.toString());
    });

    it("should return 500 if like already exists", async () => {
      // Add a like first
      await request(app)
        .post("/likes")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          postId: postId.toString()
        });

      // Try to add the same like again
      const res = await request(app)
        .post("/likes")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          postId: postId.toString()
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Failed to add like");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app)
        .post("/likes")
        .send({
          postId: postId.toString()
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("DELETE /likes/:postId", () => {
    it("should remove a like from a post", async () => {
      // Add a like first
      await request(app)
        .post("/likes")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          postId: postId.toString()
        });

      // Now delete the like
      const res = await request(app)
        .delete(`/likes/${postId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Like deleted successfully");
      
      // Verify the like is deleted
      const likes = await Like.find({ 
        userId: userId, 
        postId: postId 
      });
      expect(likes.length).toBe(0);
    });

    it("should return 500 if trying to delete a non-existent like", async () => {
      // Try to delete a like that doesn't exist
      const nonExistentPostId = new Types.ObjectId();
      const res = await request(app)
        .delete(`/likes/${nonExistentPostId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Failed to delete like");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app)
        .delete(`/likes/${postId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});