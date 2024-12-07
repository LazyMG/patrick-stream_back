import { Request, Response } from "express";
import { IAlbum, IAlbumInput } from "../types/dataTypes";
import Album from "../models/PSAlbum";

export const uploadAlbum = async (
  req: Request<{}, {}, { albumData: IAlbumInput }>,
  res: Response
) => {
  const { albumData } = req.body;

  const newData: IAlbum = {
    title: albumData.title,
    coverImg: albumData.coverImg,
    category: albumData.category,
    introduction: albumData.introduction,
    length: +albumData.length,
    released_at: albumData.released_at,
  };

  try {
    await Album.create({
      title: newData.title,
      introduction: newData.introduction,
      released_at: newData.released_at,
      category: newData.category,
      length: newData.length,
      coverImg: newData.coverImg,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Upload Failed" });
  }

  res.status(200).send({ ok: true, message: "Upload Success" });
};

export const getAlbumsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Album.countDocuments();
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Count Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Count Success", counts });
};

export const getAllAlbums = async (req: Request, res: Response) => {
  let allAlbums = [];

  try {
    allAlbums = await Album.find({});
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get All Albums Failed" });
  }
  res
    .status(200)
    .send({ ok: true, message: "Get All Albums Success", allAlbums });
};

export const getAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Album Failed" });
  }

  res.status(200).send({ ok: true, message: "Get Album Success", album });
};

export const getAlbumMusics = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  let musics = [];

  try {
    const album = await Album.findById(albumId);
    musics = album.musics;
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Album Musics Failed" });
  }

  res
    .status(200)
    .send({ ok: true, message: "Get Album Musics Success", musics });
};

export const addMusic = async (req: Request, res: Response) => {
  console.log("앨범에 음악 추가");
};

export const deleteMusic = async (req: Request, res: Response) => {
  console.log("앨범에서 음악 삭제");
};
