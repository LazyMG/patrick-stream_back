import { Request, Response } from "express";
import { IMusic, IMusicInput } from "../types/dataTypes";
import Music from "../models/PSMusic";
import Album from "../models/PSAlbum";
import Artist from "../models/PSArtist";
import Playlist from "../models/PSPlaylist";
import User from "../models/PSUser";
import mongoose from "mongoose";

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
// 에러 처리 완료
// admin
export const uploadMusic = async (
  req: Request<{}, {}, { musicData: IMusicInput }>,
  res: Response
): Promise<void> => {
  const { musicData } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  const genreArray = musicData.genre.split(",");

  const newData: IMusic = {
    title: musicData.title,
    duration: +musicData.duration,
    coverImg: musicData.coverImg,
    genre: genreArray,
    released_at: musicData.released_at,
    ytId: musicData.ytId,
  };

  let isMusicExist = null;

  try {
    isMusicExist = await Music.exists({ ytId: newData.ytId });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  if (isMusicExist) {
    console.log(isMusicExist);
    res.status(200).send({
      ok: false,
      message: "Already Exists Music",
      error: false,
      type: "EXIST_MUSIC",
    });
    return;
  }

  try {
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
    res.status(500).send({ ok: false, message: "Upload Failed", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Upload Music" });
};

// 에러 처리 완료
// admin
export const getMusicsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Music.countDocuments();
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ ok: false, message: "DB Error Music Counts", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Music Count", counts });
};

// 에러 처리 완료
// admin
export const getAllMusics = async (req: Request, res: Response) => {
  let allMusics = [];

  try {
    allMusics = await Music.find({})
      .sort({ created_at: -1 })
      .populate({
        path: "artists",
        select: "artistname",
      })
      .populate({
        path: "album",
        select: "title",
      });
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get All Musics", allMusics });
};

// 에러 처리 완료
// admin
export const getMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId)
      .populate({
        path: "artists",
        select: "_id artistname",
      })
      .populate({
        path: "album",
        select: "_id title",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  if (!music) {
    res
      .status(422)
      .send({ ok: false, message: "No Music", error: false, type: "NO_DATA" });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Music", music });
};

// 에러 처리 완료
// client
export const getNewMusics = async (req: Request, res: Response) => {
  let musics = null;

  // artist, album 등록된 음악만 가져오기
  try {
    musics = await Music.find({
      artists: { $exists: true, $ne: [] },
      album: { $exists: true, $ne: null },
    })
      .sort({ created_at: -1 })
      .populate({
        path: "artists",
        select: "_id artistname coverImg",
      })
      .populate({ path: "album", select: "_id title coverImg category" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  res.status(200).send({
    ok: true,
    message: "Get New Musics",
    musics: musics.length >= 20 ? musics.slice(0, 20) : musics,
  });
};

// 에러 처리 완료
// client
export const getTrendingMusics = async (req: Request, res: Response) => {
  let musics = null;

  // artist, album 등록된 음악만 가져오기
  try {
    musics = await Music.find({
      artists: { $exists: true, $ne: [] },
      album: { $exists: true, $ne: null },
    })
      .sort({ "counts.views": -1 })
      .populate({
        path: "artists",
        select: "_id artistname coverImg",
      })
      .populate({ path: "album", select: "_id title coverImg category" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  res.status(200).send({
    ok: true,
    message: "Get Trending Musics",
    musics: musics.length >= 20 ? musics.slice(0, 20) : musics,
  });
};

// 에러 처리 완료
// client
export const getPopularMusics = async (req: Request, res: Response) => {
  let musics = null;

  // artist, album 등록된 음악만 가져오기
  try {
    musics = await Music.find({
      artists: { $exists: true, $ne: [] },
      album: { $exists: true, $ne: null },
    })
      .sort({ "counts.likes": -1 })
      .populate({
        path: "artists",
        select: "_id artistname coverImg",
      })
      .populate({ path: "album", select: "_id title coverImg category" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  res.status(200).send({
    ok: true,
    message: "Get Popular Musics",
    musics: musics.length >= 20 ? musics.slice(0, 20) : musics,
  });
};

// 에러 처리 완료
// client
export const updateView = async (req: Request, res: Response) => {
  const { musicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  if (!music) {
    res
      .status(422)
      .send({ ok: false, message: "No Music", type: "NO_DATA", error: false });
    return;
  }

  try {
    music.counts.views += 1;
    await music.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Music View Update", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Increase View!" });
};

// 에러 처리 완료
// admin
export const updateMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;
  const { changedFields } = req.body;

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  const userId = req.userId;

  if (!userId) {
    res.status(422).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  try {
    const updatedMusic = await Music.findByIdAndUpdate(
      musicId,
      { $set: changedFields }, // 변경된 필드만 덮어씀
      { new: true, runValidators: true }
      // new: true → 업데이트된 document를 반환
      // runValidators: true → 스키마 유효성 검사 반영
    );

    if (!updatedMusic) {
      res.status(404).send({
        ok: false,
        message: "No Music",
        error: false,
        type: "NO_DATA",
      });
      return;
    }
    res.status(200).send({ ok: true, message: "Update Music" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }
};

// 에러 처리 완료
// admin
export const deleteMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Get Music", error: true });
    return;
  }

  if (!music) {
    res
      .status(422)
      .send({ ok: false, message: "No Music", error: false, type: "NO_DATA" });
    return;
  }

  // case 2. album includes This Music
  try {
    await Album.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Albums", error: true });
    return;
  }

  // case 3. artist includes This Music
  try {
    await Artist.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artists", error: true });
    return;
  }

  // case 4. user 'like' This Music
  try {
    await User.updateMany(
      {
        $or: [{ likedMusics: music._id }, { recentMusics: music._id }],
      },
      {
        $pull: {
          likedMusics: music._id,
          recentMusics: music._id,
        },
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Users", error: true });
    return;
  }

  // case 5. playlist includes This Music
  try {
    await Playlist.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlists", error: true });
    return;
  }

  // case 1. just delete Music -> last work
  try {
    await music.deleteOne();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Delete Music", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music" });
};
