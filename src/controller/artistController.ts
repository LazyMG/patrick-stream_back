import { Request, Response } from "express";
import { IArtist, IArtistInput } from "../types/dataTypes";
import Artist from "../models/PSArtist";
import Music from "../models/PSMusic";
import Album from "../models/PSAlbum";
import User from "../models/PSUser";
import mongoose from "mongoose";

// 에러 처리 완료
// admin
export const uploadArtist = async (
  req: Request<{}, {}, { artistData: IArtistInput }>,
  res: Response
) => {
  const { artistData } = req.body;
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
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Upload Artist" });
};

// 에러 처리 완료
// admin
export const getArtistsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Artist.countDocuments();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Artists Count", counts });
};

// 에러 처리 완료
// admin
export const getAllArtists = async (req: Request, res: Response) => {
  let allArtists = [];

  try {
    allArtists = await Artist.find({});
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get All Artists", allArtists });
};

// 안쓰고 있음
// admin
export const getArtistMusics = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let musics = [];

  try {
    const artist = await Artist.findById(artistId).populate({
      path: "musics",
      select: "_id title ytId released_at",
    });
    musics = artist.musics;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Artist Musics", musics });
};

// 안쓰고 있음
// admin
export const getArtistAlbums = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let albums = [];

  try {
    const artist = await Artist.findById(artistId).populate({
      path: "albums",
      select: "_id title category released_at length musics",
    });
    albums = artist.albums;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }
  res.status(200).send({ ok: true, message: "Get Artist Albums", albums });
};

// 에러 처리 완료
// admin
export const addMusic = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { musicId } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    console.log("Invalid Music ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
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
      .send({ ok: false, message: "No Music", error: false, type: "NO_DATA" });
    return;
  }

  try {
    artist.musics.push(music._id);
    await artist.save();
    music.artists.push(artist._id);
    await music.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Connect Music and Artist" });
    return;
  }

  res.status(200).send({ ok: true, message: "Connect Music and Artist" });
};

// 에러 처리 완료
// admin
export const addAlbum = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { albumId } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    console.log("Invalid Album ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
    return;
  }

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  if (!album) {
    res
      .status(422)
      .send({ ok: false, message: "No Album", error: false, type: "NO_DATA" });
    return;
  }

  try {
    artist.albums.push(album._id);
    await artist.save();
    album.artists.push(artist._id);
    await album.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      message: "DB Error Connect Album and Artist",
      error: true,
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Connect Album and Artist" });
};

// 에러 처리 완료
// admin
export const deleteArtistMusic = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { musicId } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    console.log("Invalid Music ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
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
      .send({ ok: false, message: "No Music", error: false, type: "NO_DATA" });
    return;
  }

  try {
    artist.musics = artist.musics.filter((m) => !m.equals(musicId));
    await artist.save();
    music.artists = music.artists.filter((a) => !a.equals(artistId));
    await music.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      message: "DB Error Save Music and Artist",
      error: true,
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music from Artist" });
};

// 에러 처리 완료
// admin
export const deleteArtistAblum = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { albumId } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    console.log("Invalid Album ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
    return;
  }

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  if (!album) {
    res.status(422).send({ ok: false, message: "No Album", error: true });
    return;
  }

  try {
    artist.albums = artist.albums.filter((a) => !a.equals(albumId));
    await artist.save();
    album.artists = album.artists.filter((a) => !a.equals(artistId));
    await album.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      ok: false,
      message: "DB Error Save Album and Artist",
      error: true,
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Album from Artist" });
};

// 에러 처리 완료
// admin
export const updateArtist = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { changedFields } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

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
    const updatedArtist = await Artist.findByIdAndUpdate(
      artistId,
      { $set: changedFields }, // 변경된 필드만 덮어씀
      { new: true, runValidators: true }
      // new: true → 업데이트된 document를 반환
      // runValidators: true → 스키마 유효성 검사 반영
    );

    if (!updatedArtist) {
      res.status(422).send({
        ok: false,
        message: "No Artist",
        error: false,
        type: "NO_DATA",
      });
      return;
    }
    res.status(200).send({ ok: true, message: "Update Artist" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist", error: true });
    return;
  }
};

// 에러 처리 완료
// admin
export const deleteAritst = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
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

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Erorr Artist", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
    return;
  }

  // case 2. delete Artist and contain musics
  try {
    await Music.updateMany(
      { artists: artist._id },
      { $pull: { artists: artist._id } }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  // case 3. delete Artist and contain album
  try {
    await Album.updateMany(
      { artists: artist._id },
      { $pull: { artists: artist._id } }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  // case 4. delete Artist included User's following list
  try {
    const followerIds = artist.followers.map((follower) => follower._id);

    if (followerIds.length > 0) {
      const followers = await User.find({ _id: { $in: followerIds } });

      for (const follower of followers) {
        follower.followings.followingArtists = follower.followings.followingArtists.filter(
          (item) => item.toString() !== artist._id.toString()
        );
      }

      await Promise.all(followers.map((follower) => follower.save()));
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  // case 1. delete Artist -> last work
  try {
    await artist.deleteOne();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Delete Artist", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Artist" });
};

// 에러 처리 완료
// admin
// client - Artist.tsx
export const getArtist = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { filter } = req.query;

  let artist = null;

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (filter === "all") {
    try {
      artist = await Artist.findById(artistId)
        .populate({
          path: "musics",
          select: "coverImg title ytId counts album duration released_at",
          match: {
            $or: [
              { artists: { $exists: true, $ne: [] } },
              { album: { $exists: true, $ne: null } },
            ],
          },
          populate: [
            {
              path: "album",
              select: "title _id",
            },
            {
              path: "artists",
              select: "_id artistname",
            },
          ],
        })
        .populate({
          path: "albums",
          select:
            "coverImg title _id released_at category musics artists length",
          match: {
            artists: { $exists: true, $ne: [] },
          },
          populate: [
            {
              path: "musics",
              select: "ytId title duration",
            },
            {
              path: "artists",
              select: "_id artistname coverImg",
            },
          ],
        });

      if (artist && artist.musics) {
        artist.musics.sort((a, b) => b.counts.views - a.counts.views); // views 기준 내림차순 정렬
      }
    } catch (error) {
      // 처리 완료
      console.log(error);
      res
        .status(500)
        .send({ ok: false, message: "DB Error Artist", error: true });
      return;
    }

    // 처리 완료
    if (!artist) {
      res.status(422).send({
        ok: false,
        message: "No Artist",
        error: false,
        type: "NO_DATA",
      });
      return;
    }

    res.status(200).send({ ok: true, message: "Get Artist", artist });
  } else {
    try {
      artist = await Artist.findById(artistId)
        .populate({
          path: "musics",
          select: "coverImg title ytId counts album duration released_at",
          match: {
            $and: [
              { artists: { $exists: true, $ne: [] } },
              { album: { $exists: true, $ne: null } },
            ],
          },
          populate: [
            {
              path: "album",
              select: "title _id",
            },
            {
              path: "artists",
              select: "_id artistname",
            },
          ],
        })
        .populate({
          path: "albums",
          select:
            "coverImg title _id released_at category musics artists length",
          match: {
            $and: [
              { artists: { $exists: true, $ne: [] } },
              { musics: { $exists: true, $type: "array" } }, // musics가 배열인지 확인
              {
                $expr: { $eq: [{ $size: "$musics" }, "$length"] }, // musics 배열의 길이와 length 값이 같은 경우만
              },
            ],
          },
          populate: [
            {
              path: "musics",
              select: "ytId title duration",
            },
            {
              path: "artists",
              select: "_id artistname coverImg",
            },
          ],
        });

      if (artist && artist.musics) {
        artist.musics.sort((a, b) => b.counts.views - a.counts.views); // views 기준 내림차순 정렬
      }
    } catch (error) {
      // 처리 완료
      console.log(error);
      res
        .status(500)
        .send({ ok: false, message: "DB Error Artist", error: true });
      return;
    }

    // 처리 완료
    if (!artist) {
      res.status(422).send({
        ok: false,
        message: "No Artist",
        error: false,
        type: "NO_DATA",
      });
      return;
    }

    res.status(200).send({ ok: true, message: "Get Artist", artist });
  }
};

// 에러 처리 완료
// client
export const updateArtistFollowers = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { activeUserId, addList } = req.body;

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    console.log("Invalid Artist ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid Artist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(activeUserId)) {
    console.log("Invalid User ID format");
    res.status(404).send({
      ok: false,
      message: "Invalid User ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Aritst", error: true });
    return;
  }

  if (!artist) {
    res
      .status(422)
      .send({ ok: false, message: "No Artist", error: false, type: "NO_DATA" });
    return;
  }

  let activeUser = null;

  try {
    activeUser = await User.findById(activeUserId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  if (!activeUser) {
    res
      .status(422)
      .send({ ok: false, message: "No User", error: false, type: "NO_DATA" });
    return;
  }

  try {
    if (addList) {
      //artist
      if (!artist.followers.some((user) => user._id.equals(activeUserId))) {
        artist.followers.push(activeUserId);
      }
      //user
      if (
        !activeUser.followings.followingArtists.some((user) =>
          user._id.equals(artistId)
        )
      ) {
        activeUser.followings.followingArtists = [
          artistId,
          ...activeUser.followings.followingArtists,
        ];
      }
    } else {
      //artist
      if (artist.followers.some((user) => user._id.equals(activeUserId))) {
        artist.followers = artist.followers.filter(
          (user) => !user._id.equals(activeUserId)
        );
      }
      //user
      if (
        activeUser.followings.followingArtists.some((user) =>
          user._id.equals(artistId)
        )
      ) {
        activeUser.followings.followingArtists = activeUser.followings.followingArtists.filter(
          (user) => !user._id.equals(artistId)
        );
      }
    }
    await Promise.all([artist.save(), activeUser.save()]);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artist and User", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Artist Followers" });
};
