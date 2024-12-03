import express from "express";
import { uploadMusic } from "../controller/musicController";

export const musicRouter = express.Router();

// 인기 음악
musicRouter.get("/popular", () => {});

// 트렌드 음악(조회수)
musicRouter.get("/trending", () => {});

// 최근 업데이트된 음악
musicRouter.get("/recently-updated", () => {});

// 모든 음악
musicRouter.get("/", () => {});

// 음악 등록
musicRouter.post("/", uploadMusic);
