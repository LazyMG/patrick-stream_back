import express from "express";
import {
  addMusic,
  deleteMusic,
  getAlbum,
  getAlbumMusics,
  getAlbums,
  getAlbumsCount,
  updateAlbumFollowers,
  uploadAlbum,
} from "../controller/albumController";

export const albumRouter = express.Router();

// 아티스트 등록
albumRouter.post("/", uploadAlbum);
albumRouter.get("/", getAlbums);

albumRouter.get("/count", getAlbumsCount);
// albumRouter.get("/filteredAlbums", getNeedToAddMusicAlbums);

albumRouter.post("/:albumId/music", addMusic);
albumRouter.delete("/:albumId/music", deleteMusic);
albumRouter.get("/:albumId/musics", getAlbumMusics);
albumRouter.get("/:albumId", getAlbum);
albumRouter.patch("/:albumId/followers", updateAlbumFollowers);
