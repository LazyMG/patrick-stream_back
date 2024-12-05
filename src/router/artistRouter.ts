import express from "express";
import {
  getAllArtists,
  getArtist,
  getArtistsCount,
  uploadArtist,
} from "../controller/artistController";

export const artistRouter = express.Router();

// 아티스트 등록
artistRouter.post("/", uploadArtist);
artistRouter.get("/", getAllArtists);

artistRouter.get("/count", getArtistsCount);
artistRouter.get("/:artistId", getArtist);
