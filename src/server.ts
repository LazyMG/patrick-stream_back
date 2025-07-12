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

// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? process.env.FRONT_URL
//         : process.env.FRONT_DEV_URL,
//     credentials: true,
//   })
// );

const allowedOrigins = [
  process.env.FRONT_URL, // 정식 배포 주소
  process.env.FRONT_DEV_URL, // 테스트용 프리뷰 주소 추가
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/music", musicRouter);
app.use("/playlist", playlistRouter);
app.use("/artist", artistRouter);
app.use("/album", albumRouter);
// app.use("/comment", commentRouter);
app.use("/auth", authRouter);
app.use("/", globalRouter);

export default app;
