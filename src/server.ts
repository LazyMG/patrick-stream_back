import express, { Express } from "express";

import { musicRouter } from "./router/musicRouter";
import { userRouter } from "./router/userRouter";
import { playlistRouter } from "./router/playlistRouter";
import { albumRouter } from "./router/albumRouter";
import { artistRouter } from "./router/artistRouter";
import { commentRouter } from "./router/commentRouter";
import { authRouter } from "./router/authRouter";

const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRouter);
app.use("/music", musicRouter);
app.use("/playlist", playlistRouter);
app.use("/artist", artistRouter);
app.use("/album", albumRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);

export default app;
