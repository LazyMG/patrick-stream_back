import express from "express";
import {
  addMusic,
  deleteAlbum,
  deleteAlbumMusic,
  getAlbum,
  getAlbumMusics,
  getAlbumsCount,
  getAllAlbums,
  updateAlbum,
  updateAlbumFollowers,
  uploadAlbum,
} from "../controller/albumController";
import { verifyToken } from "../middleware";

export const albumRouter = express.Router();

albumRouter.post("/", verifyToken, uploadAlbum);
albumRouter.get("/", getAllAlbums);

albumRouter.get("/count", getAlbumsCount);

albumRouter.post("/:albumId/music", addMusic);
albumRouter.delete("/:albumId/music", verifyToken, deleteAlbumMusic);

albumRouter.get("/:albumId/musics", getAlbumMusics);

albumRouter.get("/:albumId", getAlbum);
albumRouter.patch("/:albumId", verifyToken, updateAlbum);
albumRouter.delete("/:albumId", verifyToken, deleteAlbum);

albumRouter.patch("/:albumId/followers", updateAlbumFollowers);
