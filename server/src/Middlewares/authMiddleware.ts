import jwt from "jsonwebtoken";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

const authenticate = async (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

    if (err) {
      res.status(403).send(err.message);
      return;
    }

    req.user = {...user, id: user._id};
    next();
  });
};

export default authenticate;
