import { Request, Response } from "express";
import { IArtist, IArtistInput } from "../types/dataTypes";
import Artist from "../models/PSArtist";

export const uploadArtist = async (
  req: Request<{}, {}, { artistData: IArtistInput }>,
  res: Response
) => {
  const { artistData } = req.body;

  const newData: IArtist = {
    artistname: artistData.artistname,
    introduction: artistData.introduction,
    debut_at: artistData.debut_at,
    country: artistData.country,
    coverImg: artistData.coverImg,
  };

  try {
    await Artist.create({
      artistname: newData.artistname,
      introduction: newData.introduction,
      debut_at: newData.debut_at,
      country: newData.country,
      coverImg: newData.coverImg,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Upload Failed" });
  }
  res.status(200).send({ ok: true, message: "Upload Success" });
};

export const getArtistsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Artist.countDocuments();
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Count Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Count Success", counts });
};

export const getAllArtists = async (req: Request, res: Response) => {
  let allArtists = [];

  try {
    allArtists = await Artist.find({});
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get All Artists Failed" });
  }

  res
    .status(200)
    .send({ ok: true, message: "Get All Artists Success", allArtists });
};

export const getArtist = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Artist Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Artist Success", artist });
};
