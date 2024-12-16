import { Request, Response } from "express";
import Playlist from "../models/PSPlaylist";

export const getPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId)
      .populate({
        path: "musics",
        select: "_id title artists album duration counts ytId coverImg",
      })
      .populate({
        path: "user",
        select: "_id username",
      });
    // playlist = await Playlist.findById(playlistId);
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  if (!playlist) {
    res.status(422).send({ ok: false, message: "No Playlist" });
    return;
  }
  console.log(playlist);
  res.status(200).send({ ok: true, message: "Get Playlist Success", playlist });
};
