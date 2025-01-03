import express from "express";
import {
  deletePlaylist,
  getPlaylist,
  updatePlaylistFollowers,
  updatePlaylistMusics,
} from "../controller/playlistController";
import { verifyToken } from "../middleware";

export const playlistRouter = express.Router();

playlistRouter.get("/:playlistId", getPlaylist);
playlistRouter.patch("/:playlistId/followers", updatePlaylistFollowers);
playlistRouter.patch("/:playlistId", verifyToken, updatePlaylistMusics);
playlistRouter.delete("/:playlistId", verifyToken, deletePlaylist);
