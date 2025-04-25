import express from "express";
import {
  addAlbum,
  addMusic,
  deleteAritst,
  deleteArtistAblum,
  deleteArtistMusic,
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

// 안쓰고 있음
artistRouter.get("/:artistId/musics", getArtistMusics);
artistRouter.get("/:artistId/albums", getArtistAlbums);

artistRouter.post("/:artistId/music", verifyToken, addMusic);
artistRouter.post("/:artistId/album", verifyToken, addAlbum);
artistRouter.delete("/:artistId/music", verifyToken, deleteArtistMusic);
artistRouter.delete("/:artistId/album", verifyToken, deleteArtistAblum);

artistRouter.get("/:artistId", getArtist);
artistRouter.patch("/:artistId", verifyToken, updateArtist);
artistRouter.delete("/:artistId", verifyToken, deleteAritst);

artistRouter.patch("/:artistId/followers", updateArtistFollowers);
