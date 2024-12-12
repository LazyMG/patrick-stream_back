import express from "express";
import { login, signIn } from "../controller/authController";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/signIn", signIn);

authRouter.post("/logout", () => {});
