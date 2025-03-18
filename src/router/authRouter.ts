import express from "express";
import {
  checkPassword,
  emailValidate,
  getAdmin,
  getSession,
  googleLogin,
  login,
  logOut,
  refreshAccessToken,
  signIn,
} from "../controller/authController";
import { verifyToken } from "../middleware";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/signIn", signIn);
authRouter.post("/google-login", googleLogin);

authRouter.post("/logout", logOut);

authRouter.get("/session", verifyToken, getSession);
authRouter.get("/admin", verifyToken, getAdmin);
authRouter.post("/email", emailValidate);

authRouter.post("/password", verifyToken, checkPassword);
authRouter.post("/refreshToken", refreshAccessToken);
