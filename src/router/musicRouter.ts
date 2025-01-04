import express from "express";
import {
  getAllMusics,
  getMusic,
  getMusicsCount,
  getNewMusics,
  updateMusic,
  updateView,
  uploadMusic,
} from "../controller/musicController";
import { verifyToken } from "../middleware";

export const musicRouter = express.Router();

// 인기 음악
musicRouter.get("/popular", () => {});

// 트렌드 음악(조회수)
musicRouter.get("/trending", () => {});

// 최근 업데이트된 음악
musicRouter.get("/recently-updated", getNewMusics);

// 모든 음악
musicRouter.get("/", getAllMusics);

// 모든 음악 수
musicRouter.get("/count", getMusicsCount);

// 음악 등록
musicRouter.post("/", verifyToken, uploadMusic);

musicRouter.get("/:musicId", getMusic);
musicRouter.patch("/:musicId", verifyToken, updateMusic);

musicRouter.patch("/:musicId/views", updateView);
