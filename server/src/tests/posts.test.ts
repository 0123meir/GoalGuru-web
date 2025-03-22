import { config } from "dotenv";
config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testpostsdb";
// Mock directories for image storage
process.env.SERVER_URL = "http://localhost:5000";

import { connect, Types, ObjectId, connection } from "mongoose";
import request from "supertest";
import app from "../app";
import Post from "../db/postSchema";
import fs from "fs";
import path from "path";
import { postImagesDirectory, profileImagesDirectory } from "../config/config";

// Make sure directories exist for testing
if (!fs.existsSync(postImagesDirectory)) {
  fs.mkdirSync(postImagesDirectory, { recursive: true });
}
if (!fs.existsSync(profileImagesDirectory)) {
  fs.mkdirSync(profileImagesDirectory, { recursive: true });
}

let postId: ObjectId;
let accessToken: string;
let posterId: string;
const mockUser = {
  name: "123meir",
  email: `meir${Math.floor(Math.random() * 100000)}@mail.com`,
  password: "superSecretPassword",
};

beforeAll(async () => {
  await connect(process.env.DATABASE_URL);

  const res = await request(app).post("/auth/register").send(mockUser);
  posterId = res.body._id;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);
  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();

  const samplePost = new Post({
    description: "Sample Post",
    posterId: new Types.ObjectId(),
    publishTime: Date.now(),
    imageUrls: [],
  });
  const savedPost = await samplePost.save();
  postId = savedPost._id as ObjectId;
});

afterAll(async () => {
  await connection.db.dropDatabase();
  await connection.close();
});

describe("Testing Post Routes", () => {
  describe("POST /posts", () => {
    it("should create a new post", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "Bearer " + accessToken)
        .field("description", "Hello, world!");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("post");
      expect(res.body.post).toHaveProperty("description", "Hello, world!");
    });

    it("should return 400 for missing description", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Required body not provided");
    });

    it("should return 400 for invalid parameter types", async () => {
      const res = await request(app)
        .post("/posts")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          description: 12345,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Wrong type in one of the body parameters");
    });
  });

  describe("GET /posts", () => {
    it("should retrieve posts for authenticated user", async () => {
      const res = await request(app)
        .get("/posts")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe("GET /posts/poster", () => {
    it("should retrieve posts by posterId", async () => {
      const posterId = new Types.ObjectId();
      const samplePost = new Post({
        description: "By poster",
        posterId,
        publishTime: Date.now(),
        imageUrls: [],
      });
      await samplePost.save();

      const res = await request(app)
        .get("/posts/poster")
        .set("Authorization", "Bearer " + accessToken)
        .query({ id: posterId.toString() });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should return 404 if posterId is not provided", async () => {
      const res = await request(app)
        .get("/posts/poster")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "PosterId not provided");
    });
  });

  describe("GET /posts/:id", () => {
    it("should retrieve a post by ID", async () => {
      const res = await request(app)
        .get(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", postId.toString());
    });

    it("should return 404 for non-existent post ID", async () => {
      const newId = new Types.ObjectId();
      const res = await request(app)
        .get(`/posts/${newId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 400 for invalid post ID format", async () => {
      const res = await request(app)
        .get("/posts/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid post ID");
    });
  });

  describe("PUT /posts/:id", () => {
    it("should update a post by ID", async () => {
      // Create a post that the authenticated user owns
      const userPost = new Post({
        description: "User's post",
        posterId: posterId,
        publishTime: Date.now(),
        imageUrls: [],
      });
      const savedUserPost = await userPost.save();

      const res = await request(app)
        .put(`/posts/${savedUserPost._id}`)
        .set("Authorization", "Bearer " + accessToken)
        .field("description", "Updated description!")
        .field("existingImages", JSON.stringify([]));

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Post updated successfully");
      expect(res.body.post).toHaveProperty("description", "Updated description!");
    });

    it("should return 400 for missing description", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Required body not provided");
    });

    it("should return 400 for invalid description type", async () => {
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          description: 12345,
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Wrong type body parameters");
    });

    it("should return 404 for non-existent post ID", async () => {
      const invalidId = new Types.ObjectId();
      const res = await request(app)
        .put(`/posts/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          description: "Non-existent post update",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post not found");
    });

    it("should return 403 when trying to update another user's post", async () => {
      // Post is owned by another user
      const res = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          description: "Trying to update someone else's post",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error", "Unauthorized to update this post");
    });
  });

  describe("DELETE /posts/:id", () => {
    it("should delete a post by ID", async () => {
      // Create a post that the authenticated user owns
      const userPost = new Post({
        description: "User's post to delete",
        posterId: posterId,
        publishTime: Date.now(),
        imageUrls: [],
      });
      const savedUserPost = await userPost.save();

      const res = await request(app)
        .delete(`/posts/${savedUserPost._id}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Post deleted successfully");
    });

    it("should return 403 when trying to delete another user's post", async () => {
      const res = await request(app)
        .delete(`/posts/${postId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error", "Unauthorized to delete this post");
    });

    it("should return 400 for invalid post ID format", async () => {
      const res = await request(app)
        .delete("/posts/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid post ID");
    });
  });
});