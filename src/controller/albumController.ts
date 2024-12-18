import { Request, Response } from "express";
import { IAlbum, IAlbumInput } from "../types/dataTypes";
import Album from "../models/PSAlbum";
import Music from "../models/PSMusic";

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

export const getAlbums = async (req: Request, res: Response) => {
  const { filterByMusicsLength } = req.query;
  let albums = [];

  try {
    if (filterByMusicsLength === "true") {
      // 음악 길이가 앨범 길이보다 작은 앨범만 가져오기
      albums = await Album.aggregate([
        {
          $match: {
            $expr: {
              $lt: [{ $size: "$musics" }, "$length"],
            },
          },
        },
      ]);
    } else {
      // 모든 앨범 가져오기
      albums = await Album.find({});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "Get Albums Failed" });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Albums Success", albums });
};

// 어드민 관련은 query 추가하기
export const getAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  let album = null;

  //client 관점
  // 아티스트 이름, 아이디, 이미지
  // 음악 제목, ytId, 재생 횟수
  try {
    album = await Album.findById(albumId)
      .populate({
        path: "artists",
        select: "artistname _id coverImg",
      })
      .populate({
        path: "musics",
        select: "ytId title counts",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "Get Album Failed" });
    return;
  }

  if (!album) {
    res.status(422).send({ ok: false, message: "No Album" });
    return;
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
    return;
  }

  res
    .status(200)
    .send({ ok: true, message: "Get Album Musics Success", musics });
};

export const addMusic = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { musicId } = req.body;

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album" });
    return;
  }

  if (!album) {
    res.status(422).send({ ok: false, message: "No Album" });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music" });
    return;
  }

  if (!music) {
    res.status(422).send({ ok: false, message: "No Music" });
    return;
  }

  try {
    album.musics.push(music._id);
    await album.save();
    music.album = album._id;
    await music.save();
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error Connect" });
    return;
  }

  res.status(200).send({ ok: true, message: "Music Album Connect Success" });
};

export const deleteMusic = async (req: Request, res: Response) => {
  console.log("앨범에서 음악 삭제");
};
