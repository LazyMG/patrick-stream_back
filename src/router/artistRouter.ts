import express from "express";
import { uploadArtist } from "../controller/artistController";

export const artistRouter = express.Router();

// 아티스트 등록
artistRouter.post("/", uploadArtist);
