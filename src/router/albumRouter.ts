import express from "express";
import { uploadAlbum } from "../controller/albumController";

export const albumRouter = express.Router();

// 아티스트 등록
albumRouter.post("/", uploadAlbum);
