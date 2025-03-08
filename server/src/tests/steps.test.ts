import { config } from "dotenv";
config();
process.env.DATABASE_URL = "mongodb://127.0.0.1:27017/teststepsdb";

import { connect, Types, ObjectId, connection } from "mongoose";
import request from "supertest";
import app from "../app";
import { Goal, Step } from "../db/schemas";

let goalId: ObjectId;
let creatorId: ObjectId;
let stepId: ObjectId;
let accessToken: string;
const mockUser = {
  username: "123meir",
  email: "meir@mail.com",
  password: "superSecretPassword",
};

beforeAll(async () => {
  await connect(process.env.DATABASE_URL);

  const res = await request(app).post("/auth/register").send(mockUser);

  creatorId = res.body._id;

  const sampleGoal = new Goal({
    name: "Sample Goal",
    creatorId: creatorId,
  });
  const savedGoal = await sampleGoal.save();
  goalId = savedGoal._id as ObjectId;
});

const loginUser = async () => {
  const response = await request(app).post("/auth/login").send(mockUser);

  accessToken = response.body.accessToken;
};

beforeEach(async () => {
  await loginUser();
});

afterAll(async () => {
  await connection.db.dropDatabase();
  await connection.close();
});

describe("Step Routes Tests", () => {
  it("should save a new step", async () => {
    const res = await request(app)
      .post("/steps/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        description: "This is a test step",
        completed: false,
        goalId: goalId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("step");
    expect(res.body.step).toHaveProperty("_id");
    expect(res.body.step).toHaveProperty("description", "This is a test step");

    stepId = res.body.step._id;
  });

  it("should return 400 for invalid body parameters", async () => {
    const res = await request(app)
      .post("/steps/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        data: "creatorId",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  it("should return 400 for invalid goalId format", async () => {
    const res = await request(app)
      .post("/steps/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        description: "Invalid goalId test",
        completed: true,
        goalId: "invalid-id",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("wrong type in one of the body parameters");
  });

  it("should return 404 for non-existent goalId", async () => {
    const res = await request(app)
      .post("/steps/")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        description: "Non-existent goalId test",
        completed: false,
        goalId: new Types.ObjectId(),
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toBe("goal does not exist");
  });

  it("should retrieve a step by ID", async () => {
    const res = await request(app)
      .get(`/steps/${stepId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", stepId);
  });

  it("should return 404 for non-existent step ID", async () => {
    const res = await request(app)
      .get(`/steps/${new Types.ObjectId()}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(404);
  });

  it("should retrieve steps by goalId", async () => {
    const steps = await Step.find();

    const res = await request(app)
      .get(`/steps/goal/${goalId}`)
      .set("Authorization", "Bearer " + accessToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("should return 400 for invalid goalId format", async () => {
    const res = await request(app)
      .get("/steps/goal/invalid-id")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid goal ID");
  });

  it("should update a step by ID", async () => {
    const res = await request(app)
      .put(`/steps/${stepId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        description: "Updated step description",
        completed: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("description", "Updated step description");
  });

  it("should return 400 for missing body in update", async () => {
    const res = await request(app)
      .put(`/steps/${stepId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe("required body not provided");
  });

  it("should delete a step by ID", async () => {
    const res = await request(app)
      .delete(`/steps/${stepId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Step deleted successfully");

    const check = await request(app)
      .get(`/steps/${stepId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(check.statusCode).toBe(404);
  });

  it("should return 400 for invalid step ID format in delete", async () => {
    const res = await request(app)
      .delete(`/steps/invalid-id`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid step ID");
  });

  it("should return 404 for non-existent step ID in delete", async () => {
    const res = await request(app)
      .delete(`/steps/${new Types.ObjectId()}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res.statusCode).toBe(404);
  });
});
