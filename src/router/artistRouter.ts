import express from "express";
import {
  addAlbum,
  addMusic,
  deleteAblum,
  deleteAritst,
  deleteMusic,
  getAllArtists,
  getArtist,
  getArtistAlbums,
  getArtistMusics,
  getArtistsCount,
  updateArtist,
  updateArtistFollowers,
  uploadArtist,
} from "../controller/artistController";
import { verifyToken } from "../middleware";

export const artistRouter = express.Router();

// 아티스트 등록
artistRouter.post("/", verifyToken, uploadArtist);
artistRouter.get("/", getAllArtists);

artistRouter.get("/count", getArtistsCount);
artistRouter.get("/:artistId/musics", getArtistMusics);
artistRouter.get("/:artistId/albums", getArtistAlbums);

artistRouter.post("/:artistId/music", addMusic);
artistRouter.post("/:artistId/album", addAlbum);
artistRouter.delete("/:artistId/music", deleteMusic);
artistRouter.delete("/:artistId/album", deleteAblum);

artistRouter.get("/:artistId", getArtist);
artistRouter.patch("/:artistId", verifyToken, updateArtist);
artistRouter.delete("/:artistId", verifyToken, deleteAritst);

artistRouter.patch("/:artistId/followers", updateArtistFollowers);
