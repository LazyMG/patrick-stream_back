import express from "express";
import { getPlaylist } from "../controller/playlistController";

export const playlistRouter = express.Router();

playlistRouter.get("/:playlistId", getPlaylist);
