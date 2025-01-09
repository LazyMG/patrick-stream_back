import { Request, Response } from "express";
import { IMusic, IMusicInput } from "../types/dataTypes";
import Music from "../models/PSMusic";
import Album from "../models/PSAlbum";
import Artist from "../models/PSArtist";
import Playlist from "../models/PSPlaylist";
import User from "../models/PSUser";

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
// admin
export const uploadMusic = async (
  req: Request<{}, {}, { musicData: IMusicInput }>,
  res: Response
): Promise<void> => {
  const { musicData } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
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
    res
      .status(200)
      .send({ ok: false, message: "Already Exists Music", error: false });
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

  res.status(200).send({ ok: true, message: "Upload Success" });
};

// admin
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

// admin
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

// admin
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

// client
export const getNewMusics = async (req: Request, res: Response) => {
  let musics = null;

  // artist, album 등록된 음악만 가져오기
  try {
    musics = await Music.find({
      artists: { $exists: true, $ne: [] },
      album: { $exists: true, $ne: null },
    })
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
    message: "New Musics",
    musics: musics.length >= 20 ? musics.reverse().slice(0, 20) : musics,
  });
};

// client
export const updateView = async (req: Request, res: Response) => {
  const { musicId } = req.params;

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
    music.counts.views += 1;
    await music.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music View Update" });
    return;
  }

  res.status(200).send({ ok: true, message: "Increase View!" });
};

// admin
export const updateMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;
  const { changedFields } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
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
      res.status(404).send({ ok: false, message: "No Music" });
      return;
    }
    res.status(200).send({ ok: true, message: "Music Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music" });
    return;
  }
};

// admin
export const deleteMusic = async (req: Request, res: Response) => {
  const { musicId } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Erorr Get Music" });
    return;
  }

  if (!music) {
    res.status(422).send({ ok: false, message: "No Music" });
    return;
  }

  // case 2. album includes This Music
  try {
    await Album.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log("Error removing music from albums:", error);
    res.status(500).send({ ok: false, message: "DB Error Albums Pull" });
    return;
  }

  // case 3. artist includes This Music
  try {
    await Artist.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log("Error removing music from artists:", error);
    res.status(500).send({ ok: false, message: "DB Error Artists Pull" });
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
    console.log("Error removing music from users' musics:", error);
    res.status(500).send({ ok: false, message: "DB Error Users Pull" });
    return;
  }

  // case 5. playlist includes This Music
  try {
    await Playlist.updateMany(
      { musics: music._id },
      { $pull: { musics: music._id } }
    );
  } catch (error) {
    console.log("Error removing music from playlists:", error);
    res.status(500).send({ ok: false, message: "DB Error Playlists Pull" });
    return;
  }

  // case 1. just delete Music -> last work
  try {
    await music.deleteOne();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Delete Music" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music" });
};
