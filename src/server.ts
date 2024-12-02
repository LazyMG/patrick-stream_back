import express, { Express } from "express";

import { musicRouter } from "./router/musicRouter";
import { userRouter } from "./router/userRouter";
import { playlistRouter } from "./router/playlistRouter";
import { albumRouter } from "./router/albumRouter";
import { artistRouter } from "./router/artistRouter";

const app: Express = express();

app.use("/music", musicRouter);
app.use("/user", userRouter);
app.use("/playlist", playlistRouter);
app.use("/album", albumRouter);
app.use("/artist", artistRouter);

export default app;
