import express from "express";
import User from "../db/userSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../DAL/users";
import { Response, Request, NextFunction } from "express";
import { VerifyErrors } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../Middlewares/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { formatProfileImage } from "../config/config";

interface UserProps {
  _id: string;
  username: string;
  email: string;
  tokens: string[];
  profileImage: string
}

interface JwtPayload {
  _id: string;
}

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../image_storage/profile_images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const extractUserProps = (user: any): UserProps => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  tokens: user.tokens,
  profileImage: user.profileImage
});

const sendError = (res: Response, errorMessage = "") =>
  res.status(400).json({ error: errorMessage });

router.post(
  "/register",
  upload.single("profileImage"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const profileImage = req.file ? req.file.path : undefined;
      
      if (!name || !email || !password) { 
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const user = await createUser(name, email, password, profileImage);

      res.status(201).json(extractUserProps(user));
      return;
    } catch (error: any) {
      console.error("Error during registration:", error.message);
      sendError(res, error.message);
      return;
    }
  }
);

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
      { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET!
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
      profileImage: formatProfileImage(user.profileImage || 'default-user.png') 
    });
    return;
  } catch (err: any) {
    console.error("Error during login:", err.message);
    sendError(res, err.message);
    return;
  }
});

router.post(
  "/logout",
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    if (!token) {
      res.sendStatus(401);
      return;
    }

    jwt.verify(
      token as string,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err: VerifyErrors | null, userInfo: any) => {
        if (err) {
          res.status(403).send(err.message);
          return;
        }

        const userId = (userInfo as JwtPayload)._id;
        try {
          const user = await User.findById(userId);
          if (!user) {
            res.status(403).send("Invalid request");
            return;
          }

          if (!user.tokens.includes(token)) {
            user.tokens = [];
            await user.save();
            res.status(403).send("Invalid request");
            return;
          }

          user.tokens.splice(user.tokens.indexOf(token), 1);
          await user.save();

          res.status(200).send({ message: "Logout successful" });
          return;
        } catch (err: any) {
          console.error("Error during logout:", err.message);
          res.status(403).send({ message: err.message });
          return;
        }
      }
    );
  }
);

router.post(
  "/refreshToken",
  async (req: Request, res: Response): Promise<void> => {
    const authHeaders = req.headers["authorization"];
    const token = authHeaders && authHeaders.split(" ")[1];

    if (!token) {
      res.sendStatus(401);
      return;
    }

    jwt.verify(
      token as string,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err: VerifyErrors | null, userInfo: any) => {
        if (err) {
          res.status(403).send(err.message);
          return;
        }

        const userId = (userInfo as JwtPayload)._id;
        try {
          const user = await User.findById(userId);
          if (!user) {
            res.status(403).send("Invalid request");
            return;
          }

          if (!user.tokens.includes(token)) {
            user.tokens = [];
            await user.save();
            res.status(403).send("Invalid request");
            return;
          }

          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
          );

          const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET!
          );

          user.tokens[user.tokens.indexOf(token)] = refreshToken;
          await user.save();

          res.status(200).send({
            accessToken,
            refreshToken,
          });
          return;
        } catch (err: any) {
          console.error("Error during token refresh:", err.message);
          res.status(403).send(err.message);
          return;
        }
      }
    );
  }
);

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    console.log("Token:", token, process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub, picture } = ticket.getPayload()!;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, googleId: sub, profileImage: picture });
      await user.save();
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
    );
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET!
    );

    user.tokens.push(refreshToken);
    await user.save();

    res.json({ accessToken, refreshToken, username: name, id: user.id, email: user.email, profileImage: formatProfileImage(user.profileImage) });
    return;
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res
      .status(401)
      .json({ error: "Invalid Google token", details: error.message });
    return;
  }
});

export default router;
