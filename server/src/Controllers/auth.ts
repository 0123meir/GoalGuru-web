import express from "express";
import User from "../db/userSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../DAL/users";
import { Response, Request, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../Middlewares/authMiddleware";

interface UserProps {
  _id: string;
  username: string;
  email: string;
  tokens: string[];
}

interface JwtPayload {
  _id: string;
}

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const extractUserProps = (user: any): UserProps => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  tokens: user.tokens,
});

const sendError = (res: Response, errorMessage = "") =>
  res.status(400).json({ error: errorMessage });

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const user = await createUser(username, email, password);

    res.status(201).json(extractUserProps(user));
    return;
  } catch (error: any) {
    console.log("registration returned error:", error.message);
    sendError(res, error.message);
    return;
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendError(res, "Missing email or password");
    return;
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      sendError(res, "Bad email or password");
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      sendError(res, "Bad email or password");
      return;
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: process.env.JWT_TOKEN_EXPIRATION! },
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET!,
    );

    if (!user.tokens) {
      user.tokens = [refreshToken];
    } else {
      user.tokens.push(refreshToken);
    }

    await user.save();

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
    });
    return;
  } catch (err: any) {
    sendError(res, err.message);
  }
});

router.post("/logout", async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET!, async (err: VerifyErrors | null, userInfo: any) => {
    if (err) {
      res.status(403).send(err.message);
      return;
    }

    const userId = (userInfo as JwtPayload)._id;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(403).send("Invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = [];
        await user.save();
        return res.status(403).send("Invalid request");
      }

      user.tokens.splice(user.tokens.indexOf(token), 1);
      await user.save();

      res.status(200).send();
      return;
    } catch (err: any) {
      res.status(403).send({ message: err.message });
      return;
    }
  });
});

router.post("/refreshToken", async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token as string, process.env.REFRESH_TOKEN_SECRET!, async (err: VerifyErrors | null, userInfo: any) => {
    if (err) return res.status(403).send(err.message);

    const userId = (userInfo as JwtPayload)._id;
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(403).send("Invalid request");

      if (!user.tokens.includes(token)) {
        user.tokens = [];
        await user.save();
        return res.status(403).send("Invalid request");
      }

      const accessToken = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION! },
      );

      const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET!,
      );

      user.tokens[user.tokens.indexOf(token)] = refreshToken;
      await user.save();

      res.status(200).send({
        accessToken,
        refreshToken,
      });
      return;
    } catch (err: any) {
      res.status(403).send(err.message);
      return;
    }
  });
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload()!;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, googleId: sub });
      await user.save();
    }

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRATION! });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET!);

    user.tokens.push(refreshToken);
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;
