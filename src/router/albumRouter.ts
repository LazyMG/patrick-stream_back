import express from "express";
import {
  addMusic,
  deleteMusic,
  getAlbum,
  getAlbumMusics,
  getAlbums,
  getAlbumsCount,
  updateAlbum,
  updateAlbumFollowers,
  uploadAlbum,
} from "../controller/albumController";
import { verifyToken } from "../middleware";

export const albumRouter = express.Router();

// 아티스트 등록
albumRouter.post("/", verifyToken, uploadAlbum);
albumRouter.get("/", getAlbums);

albumRouter.get("/count", getAlbumsCount);
// albumRouter.get("/filteredAlbums", getNeedToAddMusicAlbums);

albumRouter.post("/:albumId/music", addMusic);
albumRouter.delete("/:albumId/music", deleteMusic);
albumRouter.get("/:albumId/musics", getAlbumMusics);
albumRouter.get("/:albumId", getAlbum);
albumRouter.patch("/:albumId", verifyToken, updateAlbum);
albumRouter.patch("/:albumId/followers", updateAlbumFollowers);
