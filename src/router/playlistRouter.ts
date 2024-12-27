import express from "express";
import {
  getPlaylist,
  updatePlaylistFollowers,
} from "../controller/playlistController";

export const playlistRouter = express.Router();

playlistRouter.get("/:playlistId", getPlaylist);
playlistRouter.patch("/:playlistId/followers", updatePlaylistFollowers);
