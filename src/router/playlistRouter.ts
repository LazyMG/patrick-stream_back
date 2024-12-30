import express from "express";
import {
  getPlaylist,
  updatePlaylistFollowers,
  updatePlaylistMusics,
} from "../controller/playlistController";
import { verifyToken } from "../middleware";

export const playlistRouter = express.Router();

playlistRouter.get("/:playlistId", getPlaylist);
playlistRouter.patch("/:playlistId/followers", updatePlaylistFollowers);
playlistRouter.patch("/:playlistId/musics", verifyToken, updatePlaylistMusics);
