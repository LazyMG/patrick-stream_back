import express from "express";
import {
  getSession,
  login,
  logOut,
  signIn,
} from "../controller/authController";
import { verifyToken } from "../middleware";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/signIn", signIn);

authRouter.post("/logout", logOut);

authRouter.get("/session", verifyToken, getSession);
