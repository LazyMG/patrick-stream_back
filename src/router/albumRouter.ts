import express from "express";
import {
  getAlbum,
  getAlbumsCount,
  getAllAlbums,
  uploadAlbum,
} from "../controller/albumController";

export const albumRouter = express.Router();

// 아티스트 등록
albumRouter.post("/", uploadAlbum);
albumRouter.get("/", getAllAlbums);

albumRouter.get("/count", getAlbumsCount);

albumRouter.get("/:albumId", getAlbum);
