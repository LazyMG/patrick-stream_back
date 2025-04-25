import { Request, Response } from "express";
import { IAlbum, IAlbumInput } from "../types/dataTypes";
import Album from "../models/PSAlbum";
import Music from "../models/PSMusic";
import User from "../models/PSUser";
import Artist from "../models/PSArtist";
import mongoose from "mongoose";

// 에러 처리 완료
// admin
export const uploadAlbum = async (
  req: Request<{}, {}, { albumData: IAlbumInput }>,
  res: Response
) => {
  const { albumData } = req.body;
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

  const newData: IAlbum = {
    title: albumData.title,
    coverImg: albumData.coverImg,
    category: albumData.category,
    introduction: albumData.introduction,
    length: +albumData.length,
    released_at: albumData.released_at,
    total_duration: +albumData.total_duration,
  };

  try {
    await Album.create({
      title: newData.title,
      introduction: newData.introduction,
      released_at: newData.released_at,
      category: newData.category,
      length: newData.length,
      coverImg: newData.coverImg,
      total_duration: newData.total_duration,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Upload Album" });
};

// 에러 처리 완료
// admin
export const getAlbumsCount = async (req: Request, res: Response) => {
  let counts = 0;

  try {
    counts = await Album.countDocuments();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Album Counts", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Albums Count", counts });
};

// 에러 처리 완료
// admin
export const getAllAlbums = async (req: Request, res: Response) => {
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
    res.status(500).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get All Albums", albums });
};

// 에러 처리 완료
// client
// 어드민 관련은 query 추가하기
export const getAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { filter } = req.query;

  let album = null;

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (filter === "all") {
    try {
      album = await Album.findById(albumId)
        .populate({
          path: "artists",
          select: "artistname _id coverImg",
        })
        .populate({
          path: "musics",
          select: "_id ytId title released_at",
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
      console.log(error);
      res
        .status(500)
        .send({ ok: false, message: "DB Error Album", error: true });
      return;
    }
  } else {
    //client 관점
    // 아티스트 이름, 아이디, 이미지
    // 음악 제목, ytId, 재생 횟수
    try {
      album = await Album.findOne({
        _id: albumId,
        $and: [
          { artists: { $exists: true, $not: { $size: 0 } } }, // artists 배열이 비어있지 않은 경우
          {
            $expr: { $eq: [{ $size: "$musics" }, "$length"] }, // musics 배열의 길이와 length 필드 값이 같은 경우
          },
        ],
      })
        .populate({
          path: "artists",
          select: "artistname _id coverImg",
        })
        .populate({
          path: "musics",
          select: "ytId title counts duration coverImg released_at",
          match: {
            $and: [
              { artists: { $exists: true, $ne: [] } },
              { album: { $exists: true, $ne: null } },
            ],
          },
          options: {
            sort: { index: 1 }, // index 기준 정렬
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
        })
        .lean(); // 데이터를 JSON 형태로 변환
    } catch (error) {
      // 처리 완료
      console.log(error);
      res
        .status(500)
        .send({ ok: false, message: "DB Error Album", error: true });
      return;
    }
  }

  // 처리 완료
  if (!album) {
    res
      .status(422)
      .send({ ok: false, message: "No Album", error: false, type: "NO_DATA" });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Album", album });
};

// 안 쓰고 있음
// admin
export const getAlbumMusics = async (req: Request, res: Response) => {
  const { albumId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let musics = [];

  try {
    const album = await Album.findById(albumId).populate({
      path: "musics",
      select: "_id title released_at ytId",
    });
    musics = album.musics;
  } catch (error) {
    console.log(error);
    res.status(400).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Album Musics", musics });
};

// 에러 처리 완료
// admin
export const addMusic = async (req: Request, res: Response) => {
  const { albumId } = req.params;
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

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Music ID format",
      error: false,
      type: "ERROR_ID",
    });
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
    res
      .status(422)
      .send({ ok: false, message: "No Album", error: false, type: "NO_DATA" });
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
    album.musics.push(music._id);
    await album.save();
    music.album = album._id;
    await music.save();
  } catch (error) {
    res
      .status(500)
      .send({ ok: false, message: "DB Error Connect", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Connect Music and Album" });
};

// 에러 처리 완료
// admin
export const deleteAlbumMusic = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { musicId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

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
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
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

  if (!music.album || music.album.toString() !== album._id.toString()) {
    res.status(422).send({
      ok: false,
      message: "This Music is not in the given Album",
      error: false,
      type: "NOT_MATCH",
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
    res.status(500).send({
      ok: false,
      message: "DB Error Save Music and Album",
      error: true,
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Music from Album" });
};

// 에러 처리 완료
// client
export const updateAlbumFollowers = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { activeUserId, addList } = req.body;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(activeUserId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid User ID format",
      error: false,
      type: "ERROR_ID",
    });
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
    res
      .status(500)
      .send({ ok: false, message: "DB Error Album with User", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Album Followers" });
};

// 에러 처리 완료
// admin
export const updateAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const { changedFields } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
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
    const updatedAlbum = await Album.findByIdAndUpdate(
      albumId,
      { $set: changedFields }, // 변경된 필드만 덮어씀
      { new: true, runValidators: true }
      // new: true → 업데이트된 document를 반환
      // runValidators: true → 스키마 유효성 검사 반영
    );

    if (!updatedAlbum) {
      res.status(404).send({
        ok: false,
        message: "No Album",
        error: false,
        type: "NO_DATA",
      });
      return;
    }
    res.status(200).send({ ok: true, message: "Update Album" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Album", error: true });
    return;
  }
};

// 에러 처리 완료
// admin
export const deleteAlbum = async (req: Request, res: Response) => {
  const { albumId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(albumId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Album ID format",
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

  let album = null;

  try {
    album = await Album.findById(albumId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Erorr Album", error: true });
    return;
  }

  if (!album) {
    res
      .status(422)
      .send({ ok: false, message: "No Album", error: false, type: "NO_DATA" });
    return;
  }

  // case 2. delete Album and contain musics
  try {
    await Music.updateMany({ album: album._id }, { $set: { album: null } });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Musics", error: true });
    return;
  }

  // case 3. delete Album included Artist
  try {
    await Artist.updateMany(
      { albums: album._id },
      { $pull: { albums: album._id } }
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Artists", error: true });
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
    res.status(500).send({
      ok: false,
      message: "DB Error Removing from Followers",
      error: true,
    });
    return;
  }

  // case 1. delete Album -> last work
  try {
    await album.deleteOne();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Delete Album", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Delete Album" });
};
