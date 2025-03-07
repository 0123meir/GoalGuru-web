import express from "express";
import bodyParser from "body-parser";
import { connect } from "./db/DbConnection";
import cors from "cors";

import postRouter from "./Controllers/posts";
import commentRouter from "./Controllers/comments";
import likesRouter from "./Controllers/likes";
import userRouter from "./Controllers/users";
import authRouter from "./Controllers/auth";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import swaggerOptions from "../swagger.json";
import { postImagesDirectory, profileImagesDirectory } from "./config/config";

const app = express();
connect();
app.use(express.json());
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from React (adjust port if needed)
    credentials: true, // Allow cookies if needed
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions));
app.use("/images", express.static(postImagesDirectory));
app.use("/profile_images", express.static(profileImagesDirectory)); // Ensure this line is correct
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/likes", likesRouter);

app.use("/users", userRouter);
app.use("/auth", authRouter);

export default app;
