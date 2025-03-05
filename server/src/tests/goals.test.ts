import { config } from "dotenv";
config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/testgoalsdb";

import { connect, Types, ObjectId, connection } from "mongoose";
import request from "supertest";
import app from "../app";
import { Goal } from "../db/schemas";

let goalId: ObjectId;
let accessToken: string;
let creatorId: ObjectId;
const mockUser = {
  username: "123meir",
  email: "meir@mail.com",
  password: "superSecretPassword",
};

beforeAll(async () => {
  await connect(process.env.DATABASE_URL);

  const res = await request(app).post("/auth/register").send(mockUser);

  creatorId = res.body._id;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);

  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();

  const sampleGoal = new Goal({
    name: "Sample Goal",
    creatorId: creatorId,
  });
  const savedGoal = await sampleGoal.save();
  goalId = savedGoal._id as ObjectId;
});

afterAll(async () => {
  await connection.db.dropDatabase();
  await connection.close();
});

describe("Testing Goal Routes", () => {
  describe("POST /goals", () => {
    it("should create a new goal", async () => {
      const res = await request(app)
        .post("/goals")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: "Hello, world!",
          creatorId: creatorId,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("goal");
      expect(res.body.goal).toHaveProperty("name", "Hello, world!");
    });

    it("should return 400 for missing body parameters", async () => {
      const res = await request(app)
        .post("/goals")
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid parameter types", async () => {
      const res = await request(app)
        .post("/goals")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: 12345,
          steps: "123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("wrong type in one of the body parameters");
    });
  });

  describe("GET /goals", () => {
    it("should retrieve all goals", async () => {
      const res = await request(app)
        .get("/goals")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no goals exist", async () => {
      await Goal.deleteMany();
      const res = await request(app)
        .get("/goals")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });
  });

  describe("GET /goals/sender", () => {
    it("should retrieve goals by creatorId", async () => {
      const sampleGoal = new Goal({
        name: "By sender",
        creatorId: creatorId,
        steps: [],
      });
      await sampleGoal.save();

      const res = await request(app)
        .get("/goals/sender")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("creatorId", creatorId.toString());
    });
  });

  describe("GET /goals/:id", () => {
    it("should retrieve a goal by ID", async () => {
      const res = await request(app)
        .get(`/goals/${goalId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", goalId.toString());
    });

    it("should return 404 for non-existent goal ID", async () => {
      const newId = new Types.ObjectId();
      const res = await request(app)
        .get(`/goals/${newId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Goal not found");
    });

    it("should return 400 for invalid goal ID format", async () => {
      const res = await request(app)
        .get("/goals/invalid-id")
        .set("Authorization", "Bearer " + accessToken);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("PUT /goals/:id", () => {
    it("should update a goal by ID", async () => {
      const res = await request(app)
        .put(`/goals/${goalId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: "Updated name!",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id", goalId.toString());
      expect(res.body).toHaveProperty("name", "Updated name!");
    });

    it("should return 400 for missing body parameters", async () => {
      const res = await request(app)
        .put(`/goals/${goalId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 400 for invalid name type", async () => {
      const res = await request(app)
        .put(`/goals/${goalId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: 12345,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toBe("required body not provided");
    });

    it("should return 404 for non-existent goal ID", async () => {
      const invalidId = new Types.ObjectId();
      const res = await request(app)
        .put(`/goals/${invalidId}`)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: "Non-existent goal update",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Goal not found");
    });

    it("should return 400 for invalid goal ID format", async () => {
      const res = await request(app)
        .put("/goals/invalid-id")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: "Invalid ID format test",
        });
      expect(res.statusCode).toBe(400);
    });
  });
});
