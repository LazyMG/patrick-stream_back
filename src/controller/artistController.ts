import { Request, Response } from "express";
import { IArtist, IArtistInput } from "../types/dataTypes";
import Artist from "../models/PSArtist";
import Music from "../models/PSMusic";
import Album from "../models/PSAlbum";
import { populate } from "dotenv";
import User from "../models/PSUser";
import mongoose from "mongoose";

// admin
export const uploadArtist = async (
  req: Request<{}, {}, { artistData: IArtistInput }>,
  res: Response
) => {
  const { artistData } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
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
    res.status(400).send({ ok: false, message: "Upload Failed" });
  }
  res.status(200).send({ ok: true, message: "Upload Success" });
};

// admin
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

// admin
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

// client - Artist.tsx
// 정보 범위 정하기
export const getArtist = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  let artist = null;

  // 처리 필요
  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
    });
    return;
  }

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
        select: "coverImg title _id released_at category musics artists",
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
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "Get Artist Failed" });
    return;
  }

  // 처리 필요
  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist", error: false });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Artist Success", artist });
};

// admin
export const getArtistMusics = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  let musics = [];

  try {
    const artist = await Artist.findById(artistId).populate({
      path: "musics",
      select: "_id title ytId released_at",
    });
    musics = artist.musics;
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Artist Failed" });
    return;
  }
  res
    .status(200)
    .send({ ok: true, message: "Get Artist Musics Success", musics });
};

// admin
export const getArtistAlbums = async (req: Request, res: Response) => {
  const { artistId } = req.params;

  let albums = [];

  try {
    const artist = await Artist.findById(artistId).populate({
      path: "albums",
      select: "_id title category released_at length musics",
    });
    albums = artist.albums;
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "Get Artist Failed" });
    return;
  }
  res
    .status(200)
    .send({ ok: true, message: "Get Artist Albums Success", albums });
};

// admin
export const addMusic = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { musicId } = req.body;

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Artist" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
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

  console.log(artist, music);

  try {
    artist.musics.push(music._id);
    await artist.save();
    music.artists.push(artist._id);
    await music.save();
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error Connect" });
    return;
  }

  res.status(200).send({ ok: true, message: "Music Artist Connect Success" });
};

// admin
export const addAlbum = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { albumId } = req.body;

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Artist" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
    return;
  }

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

  try {
    artist.albums.push(album._id);
    await artist.save();
    album.artists.push(artist._id);
    await album.save();
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error Connect" });
    return;
  }

  res.status(200).send({ ok: true, message: "Music Album Connect Success" });
};

// admin
export const deleteArtistMusic = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { musicId } = req.body;

  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Artist" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
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
    artist.musics = artist.musics.filter((m) => !m.equals(musicId));
    await artist.save();
    music.artists = music.artists.filter((a) => !a.equals(artistId));
    await music.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Save Music and Artist" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music from Artist" });
};

// admin
export const deleteArtistAblum = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { albumId } = req.body;

  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Artist" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
    return;
  }

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

  try {
    artist.albums = artist.albums.filter((a) => !a.equals(albumId));
    await artist.save();
    album.artists = album.artists.filter((a) => !a.equals(artistId));
    await album.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Save Album and Artist" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Album from Artist" });
};

// client
export const updateArtistFollowers = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { activeUserId, addList } = req.body;

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Aritst" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
    return;
  }

  let activeUser = null;

  try {
    activeUser = await User.findById(activeUserId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User" });
    return;
  }

  if (!activeUser) {
    res.status(422).send({ ok: false, message: "No User" });
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
    res.status(500).send({ ok: false, message: "DB Error Artist with User" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Artist Followers" });
};

// admin
export const updateArtist = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { changedFields } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
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
      res.status(404).send({ ok: false, message: "No Artist" });
      return;
    }
    res.status(200).send({ ok: true, message: "Artist Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Artist" });
    return;
  }
};

// admin
export const deleteAritst = async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
    return;
  }

  let artist = null;

  try {
    artist = await Artist.findById(artistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Erorr Get Artist" });
    return;
  }

  if (!artist) {
    res.status(422).send({ ok: false, message: "No Artist" });
    return;
  }

  // case 2. delete Artist and contain musics
  try {
    await Music.updateMany(
      { artists: artist._id },
      { $pull: { artists: artist._id } }
    );
  } catch (error) {
    console.log("Error removing artist from musics:", error);
    res.status(500).send({ ok: false, message: "DB Error Musics Pull" });
    return;
  }

  // case 3. delete Artist and contain album
  try {
    await Album.updateMany(
      { artists: artist._id },
      { $pull: { artists: artist._id } }
    );
  } catch (error) {
    console.log("Error removing artist from albums:", error);
    res.status(500).send({ ok: false, message: "DB Error Albums Pull" });
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
    res
      .status(500)
      .send({ ok: false, message: "DB Error Removing from Followers" });
    return;
  }

  // case 1. delete Artist -> last work
  try {
    await artist.deleteOne();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Delete Artist" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Artist" });
};
