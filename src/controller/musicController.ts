import { Request, Response } from "express";
import { IMusic, IMusicInput } from "../types/dataTypes";
import Music from "../models/PSMusic";

//1. 수동 validate
//released_at:0000-00-00 형식
//released_at:0000.00.00 형식
//released_at:0000/00/00 형식
//released_at:YYYYMMDD 형식
//released_at:YYYYMDD 형식
//released_at:YYYYMMD 형식
//released_at:YYYYMD 형식
//released_at:YYMMDD 형식
//모두 0000-00-00 형식으로 바꾸기
//duration: 초 단위

export const uploadMusic = async (
  req: Request<{}, {}, { musicData: IMusicInput }>,
  res: Response
): Promise<void> => {
  const { musicData } = req.body;

  const genreArray = musicData.genre.split(",");

  const newData: IMusic = {
    title: musicData.title,
    duration: +musicData.duration,
    coverImg: musicData.coverImg,
    genre: genreArray,
    released_at: musicData.released_at,
    ytId: musicData.ytId,
  };

  try {
    console.log(musicData);

    await Music.create({
      title: newData.title,
      ytId: newData.ytId,
      coverImg: newData.coverImg,
      genre: newData.genre,
      duration: newData.duration,
      released_at: newData.released_at,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Upload Failed" });
  }

  res.status(200).send({ ok: true, message: "Upload Success" });
};

export const getMusicsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Music.countDocuments();
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Count Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Count Success", counts });
};

export const getAllMusics = async (req: Request, res: Response) => {
  let allMusics = [];

  try {
    allMusics = await Music.find({});
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get All Musics Failed" });
  }

  res
    .status(200)
    .send({ ok: true, message: "Get All Musics Success", allMusics });
};

export const getMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Music Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Music Success", music });
};
