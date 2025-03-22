import { config } from "dotenv";
config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testcommentsdb";

import { connect, Types, ObjectId, connection } from "mongoose";
import request from "supertest";
import app from "../app";
import { Comment, Post, User } from "../db/schemas";

let postId: ObjectId;
let commentId: ObjectId;
let accessToken: string;
let userId: ObjectId;

const mockUser = {
  name: "commentuser",
  email: `commentuser${Math.floor(Math.random() * 100000)}@example.com`,
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

  // Create a post for testing comments
  mockPost.posterId = userId;
  const post = new Post(mockPost);
  const savedPost = await post.save();
  postId = savedPost._id as ObjectId;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);
  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();

  // Create a sample comment before each test
  const mockComment = {
    content: "This is a test comment",
    postId: postId,
    commentorId: userId,
    username: mockUser.name,
  };

  const comment = new Comment(mockComment);
  const savedComment = await comment.save();
  commentId = savedComment._id as ObjectId;
});

afterEach(async () => {
  // Clean up comments after each test
  await Comment.deleteMany({});
});

afterAll(async () => {
  await connection.db.dropDatabase();
  await connection.close();
});

describe("Testing Comment Routes", () => {
  describe("POST /comments", () => {
    it("should create a new comment", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "This is a new comment",
          postId: postId.toString(),
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Comment saved successfully");
      expect(res.body).toHaveProperty("comment");
      expect(res.body.comment).toHaveProperty(
        "content",
        "This is a new comment"
      );
      expect(res.body.comment).toHaveProperty("postId", postId.toString());
    });

    it("should return 400 for missing content", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          postId: postId.toString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Required body not provided");
    });

    it("should return 400 for missing postId", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "Comment without post ID",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Required body not provided");
    });

    it("should return 400 for invalid postId format", async () => {
      const res = await request(app)
        .post("/comments")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "Comment with invalid post ID",
          postId: "invalid-id",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "error",
        "Wrong type in one of the body parameters"
      );
    });

    it("should return 400 for non-existent post", async () => {
      const nonExistentPostId = new Types.ObjectId();
      const res = await request(app)
        .post("/comments")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "Comment for non-existent post",
          postId: nonExistentPostId.toString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Post does not exist");
    });
  });

  describe("GET /comments/:id", () => {
    it("should retrieve a comment by ID", async () => {
      const res = await request(app)
        .get(`/comments/${commentId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", commentId.toString());
      expect(res.body).toHaveProperty("content", "This is a test comment");
    });

    it("should return 404 for non-existent comment ID", async () => {
      const nonExistentId = new Types.ObjectId();
      const res = await request(app)
        .get(`/comments/${nonExistentId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Comment not found");
    });
  });

  describe("GET /comments", () => {
    it("should retrieve all comments", async () => {
      const res = await request(app)
        .get("/comments")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /comments/:id", () => {
    it("should update a comment by ID", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "Updated comment content",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", commentId.toString());
      expect(res.body).toHaveProperty("content", "Updated comment content");
    });

    it("should return 400 for missing content", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Required body not provided");
    });

    it("should return 400 for invalid content type", async () => {
      const res = await request(app)
        .put(`/comments/${commentId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: 12345,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Wrong type body parameters");
    });

    it("should return 404 for non-existent comment ID", async () => {
      const nonExistentId = new Types.ObjectId();
      const res = await request(app)
        .put(`/comments/${nonExistentId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          content: "Update non-existent comment",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Comment not found");
    });
  });

  describe("DELETE /comments/:id", () => {
    it("should delete a comment by ID", async () => {
      const res = await request(app)
        .delete(`/comments/${commentId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Comment deleted successfully"
      );
      expect(res.body).toHaveProperty("deletedComment");
      expect(res.body.deletedComment).toHaveProperty(
        "_id",
        commentId.toString()
      );
    });

    it("should return 400 for invalid comment ID format", async () => {
      const res = await request(app)
        .delete("/comments/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid comment ID");
    });

    it("should return 404 for non-existent comment ID", async () => {
      const nonExistentId = new Types.ObjectId();
      const res = await request(app)
        .delete(`/comments/${nonExistentId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Comment not found");
    });
  });

  describe("GET /comments/post/:postId", () => {
    it("should retrieve comments by post ID", async () => {
      const res = await request(app)
        .get(`/comments/post/${postId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("postId", postId.toString());
    });

    it("should return 400 for invalid post ID format", async () => {
      const res = await request(app)
        .get("/comments/post/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid post ID");
    });

    it("should return 404 for non-existent post ID", async () => {
      const nonExistentPostId = new Types.ObjectId();
      const res = await request(app)
        .get(`/comments/post/${nonExistentPostId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Post does not exist");
    });
  });
});
