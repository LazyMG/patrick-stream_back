import { Request, Response } from "express";
import Music from "../models/PSMusic";
import Artist from "../models/PSArtist";
import Album from "../models/PSAlbum";

export const getSearchData = async (req: Request, res: Response) => {
  const { keyword } = req.query;

  let musics = await getSearchMusic(keyword.toString());

  res.status(200).send({ ok: true, message: "Get Data", musics });
};

const getSearchMusic = async (keyword: string) => {
  let musics = null;

  try {
    musics = await Music.find({
      $or: [{ title: { $regex: new RegExp(keyword, "i") } }],
    })
      .populate({ path: "artists" })
      .populate({ path: "album" });
  } catch (error) {
    console.log(error);
    return [];
  }

  if (!musics) {
    return [];
  }

  return musics;
};
