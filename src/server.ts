import express, { Express } from "express";
import cors from "cors";

import { musicRouter } from "./router/musicRouter";
import { userRouter } from "./router/userRouter";
import { playlistRouter } from "./router/playlistRouter";
import { albumRouter } from "./router/albumRouter";
import { artistRouter } from "./router/artistRouter";
import { commentRouter } from "./router/commentRouter";
import { authRouter } from "./router/authRouter";
import cookieParser from "cookie-parser";
import { globalRouter } from "./router/globalRouter";

const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/music", musicRouter);
app.use("/playlist", playlistRouter);
app.use("/artist", artistRouter);
app.use("/album", albumRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);
app.use("/", globalRouter);

export default app;
