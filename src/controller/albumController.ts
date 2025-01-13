import { Request, Response } from "express";
import { IAlbum, IAlbumInput } from "../types/dataTypes";
import Album from "../models/PSAlbum";
import Music from "../models/PSMusic";
import User from "../models/PSUser";
import Artist from "../models/PSArtist";
import mongoose from "mongoose";

// admin
export const uploadAlbum = async (
  req: Request<{}, {}, { albumData: IAlbumInput }>,
  res: Response
) => {
  const { albumData } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
    return;
  }

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
    return;
  }

  res.status(200).send({ ok: true, message: "Upload Success" });
};

// admin
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

// admin
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
      albums = await Album.find({}).populate({
        path: "artists",
        select: "artistname",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "Get Albums Failed" });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Albums Success", albums });
};

// client
// 어드민 관련은 query 추가하기
export const getAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  let album = null;

  // 처리 필요
  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
    });
    return;
  }

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
        select: "ytId title counts duration coverImg released_at",
        match: {
          $or: [
            { artists: { $exists: true, $ne: [] } },
            { album: { $exists: true, $ne: null } },
          ],
        },
        options: {
          sort: { index: 1 },
        },
        populate: [
          {
            path: "artists",
            select: "_id artistname",
          },
          {
            path: "album",
            select: "_id title",
          },
        ],
      });
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "Get Album Failed" });
    return;
  }

  // 처리 필요
  if (!album) {
    res.status(422).send({ ok: false, message: "No Album", error: false });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Album Success", album });
};

// admin
export const getAlbumMusics = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  let musics = [];

  try {
    const album = await Album.findById(albumId).populate({
      path: "musics",
      select: "_id title released_at ytId",
    });
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

// admin
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

// admin
export const deleteAlbumMusic = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { musicId } = req.body;

  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
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

  if (!music.album || music.album.toString() !== album._id.toString()) {
    res.status(422).send({
      ok: false,
      message: "This Music is not in the given Album",
    });
    return;
  }

  try {
    album.musics = album.musics.filter(
      (m) => m.toString() !== music._id.toString()
    );
    await album.save();

    music.album = null;
    await music.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Save Music and Album" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music from Album" });
};

// client
export const updateAlbumFollowers = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { activeUserId, addList } = req.body;

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
      //album
      if (!album.followers.some((user) => user._id.equals(activeUserId))) {
        album.followers.push(activeUserId);
      }
      //user
      if (
        !activeUser.followings.followingAlbums.some((user) =>
          user._id.equals(albumId)
        )
      ) {
        activeUser.followings.followingAlbums.push(albumId);
      }
    } else {
      //album
      if (album.followers.some((user) => user._id.equals(activeUserId))) {
        album.followers = album.followers.filter(
          (user) => !user._id.equals(activeUserId)
        );
      }
      //user
      if (
        activeUser.followings.followingAlbums.some((user) =>
          user._id.equals(albumId)
        )
      ) {
        activeUser.followings.followingAlbums = activeUser.followings.followingAlbums.filter(
          (user) => !user._id.equals(albumId)
        );
      }
    }
    await Promise.all([album.save(), activeUser.save()]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album with User" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Album Followers" });
};

// admin
export const updateAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { changedFields } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(422).send({ ok: false, message: "Access Denied" });
    return;
  }

  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      albumId,
      { $set: changedFields }, // 변경된 필드만 덮어씀
      { new: true, runValidators: true }
      // new: true → 업데이트된 document를 반환
      // runValidators: true → 스키마 유효성 검사 반영
    );

    if (!updatedAlbum) {
      res.status(404).send({ ok: false, message: "No Album" });
      return;
    }
    res.status(200).send({ ok: true, message: "Album Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album" });
    return;
  }
};

// admin
export const deleteAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({ ok: false, message: "Access Denied" });
    return;
  }

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Erorr Get Album" });
    return;
  }

  if (!album) {
    res.status(422).send({ ok: false, message: "No Album" });
    return;
  }

  // case 2. delete Album and contain musics
  try {
    await Music.updateMany({ album: album._id }, { $set: { album: null } });
  } catch (error) {
    console.log("Error removing album from musics:", error);
    res.status(500).send({ ok: false, message: "DB Error Musics Pull" });
    return;
  }

  // case 3. delete Album included Artist
  try {
    await Artist.updateMany(
      { albums: album._id },
      { $pull: { albums: album._id } }
    );
  } catch (error) {
    console.log("Error removing album from artists:", error);
    res.status(500).send({ ok: false, message: "DB Error Artists Pull" });
    return;
  }

  // case 4. delete Album included User's following list
  try {
    const followerIds = album.followers.map((follower) => follower._id);

    if (followerIds.length > 0) {
      const followers = await User.find({ _id: { $in: followerIds } });

      for (const follower of followers) {
        follower.followings.followingAlbums = follower.followings.followingAlbums.filter(
          (item) => item.toString() !== album._id.toString()
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

  // case 1. delete Album -> last work
  try {
    await album.deleteOne();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Delete Album" });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Album" });
};
