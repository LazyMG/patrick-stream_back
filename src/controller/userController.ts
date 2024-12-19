import { Request, Response } from "express";
import User from "../models/PSUser";
import Playlist from "../models/PSPlaylist";
import Music from "../models/PSMusic";

// 다른 사용자 페이지 들어갈 때는 정보 가려서 보내기기
export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  let user = null;

  if (userId === currentUserId) {
    // console.log("myPage!");
  }

  try {
    user = await User.findById(userId).populate({
      path: "recentMusics",
      select: "coverImg title ytId",
      populate: {
        path: "artists",
        select: "_id artistname coverImg",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Failed" });
    return;
  }

  if (!user) {
    res.status(422).send({ ok: false, message: "No User" });
    return;
  }

  res.status(200).send({ ok: true, message: "Get User Success", user });
};

export const createUserPlaylist = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const {
    data: { info, title },
  } = req.body;

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User" });
    return;
  }

  if (!user) {
    res.status(422).send({ ok: false, message: "No User" });
    return;
  }

  let playlist = null;

  try {
    playlist = await Playlist.create({
      title,
      introduction: info || "",
      user: user._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Playlist" });
    return;
  }

  try {
    user.playlists.push(playlist._id);
    await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User add Playlist" });
    return;
  }

  res
    .status(200)
    .send({ ok: true, message: "Create Playlist", id: playlist._id });
};

export const getUserAllPlaylists = async (req: Request, res: Response) => {
  const { userId } = req.params;

  let user = null;

  try {
    user = await User.findById(userId).populate({
      path: "playlists", // playlists 배열을 populate
      select: "_id title duration introduction followers", // 필요한 필드만 선택
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User" });
    return;
  }

  if (!user) {
    res.status(422).send({ ok: false, message: "No User" });
    return;
  }

  const playlists = user.playlists.map((playlist) => ({
    id: playlist._id,
    title: playlist.title,
    duration: playlist.duration,
    introduction: playlist.introduction,
    followersCount: playlist.followers.length, // followers 배열의 길이
    username: user.username,
  }));

  res
    .status(200)
    .send({ ok: true, message: "Get Playlists Success", playlists });
};

export const postUserRecentMusics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { musicId } = req.body;
  const currentUserId = req.userId;

  if (userId !== currentUserId) {
    res.status(200).send({ ok: false, message: "No Login User" });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User" });
    return;
  }

  if (!user) {
    res.status(422).send({ ok: false, message: "No User" });
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
    user.recentMusics.push(music);
    await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User Music" });
    return;
  }

  res.status(200).send({ ok: true, message: "Add User RecentMusics" });
};
