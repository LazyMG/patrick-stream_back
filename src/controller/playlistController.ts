import { Request, Response } from "express";
import Playlist from "../models/PSPlaylist";
import User from "../models/PSUser";
import Music from "../models/PSMusic";
import mongoose from "mongoose";

// 에러 처리 완료
// client
export const getPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  let playlist = null;

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Playlist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  try {
    playlist = await Playlist.findById(playlistId)
      .populate({
        path: "musics",
        select: "_id title artists album duration counts ytId coverImg",
        match: {
          $or: [
            { artists: { $exists: true, $ne: [] } },
            { album: { $exists: true, $ne: null } },
          ],
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
      .populate({
        path: "user",
        select: "_id username",
      });
  } catch (error) {
    // 처리 완료
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  // 처리 완료
  if (!playlist) {
    res.status(422).send({
      ok: false,
      message: "No Playlist",
      error: false,
      type: "NO_DATA",
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Get Playlist", playlist });
};

// 에러 처리 완료
// client
export const updatePlaylistFollowers = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { activeUserId, addList } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Playlist ID format",
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

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlist", error: true });
    return;
  }

  if (!playlist) {
    res.status(422).send({
      ok: false,
      message: "No Playlist",
      error: false,
      type: "NO_DATA",
    });
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
      if (!playlist.followers.some((user) => user._id.equals(activeUserId))) {
        playlist.followers.push(activeUserId);
      }
      //user
      if (
        !activeUser.followings.followingPlaylists.some((user) =>
          user._id.equals(playlistId)
        )
      ) {
        activeUser.followings.followingPlaylists.push(playlistId);
      }
    } else {
      //album
      if (playlist.followers.some((user) => user._id.equals(activeUserId))) {
        playlist.followers = playlist.followers.filter(
          (user) => !user._id.equals(activeUserId)
        );
      }
      //user
      if (
        activeUser.followings.followingPlaylists.some((user) =>
          user._id.equals(playlistId)
        )
      ) {
        activeUser.followings.followingPlaylists = activeUser.followings.followingPlaylists.filter(
          (user) => !user._id.equals(playlistId)
        );
      }
    }
    await Promise.all([playlist.save(), activeUser.save()]);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlist with User", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Playlist Followers" });
};

// 에러 처리 완료
// client
export const updatePlaylistMusics = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { musicId, addMusic } = req.body;
  const currentUserId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Playlist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (Array.isArray(musicId)) {
    musicId.forEach((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).send({
          ok: false,
          message: "Invalid Music ID format",
          error: false,
          type: "ERROR_ID",
        });
        return;
      }
    });
  } else {
    if (!mongoose.Types.ObjectId.isValid(musicId)) {
      res.status(404).send({
        ok: false,
        message: "Invalid Music ID format",
        error: false,
        type: "ERROR_ID",
      });
      return;
    }
  }

  if (!currentUserId) {
    res.status(404).send({
      ok: false,
      message: "No Login",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlist", error: true });
    return;
  }

  if (!playlist) {
    res.status(422).send({
      ok: false,
      message: "No Playlist",
      error: false,
      type: "NO_DATA",
    });
    return;
  }

  if (!playlist.user.equals(currentUserId)) {
    res.status(422).send({
      ok: false,
      message: "This is not a User's Playlist",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  try {
    if (addMusic) {
      const isExist = playlist.musics.some(
        (music) => music.toString() === musicId.toString()
      );
      if (!isExist) {
        playlist.musics.push(musicId);
      }
    } else {
      if (Array.isArray(musicId)) {
        playlist.musics = playlist.musics.filter(
          (music) => !musicId.includes(music.toString())
        );
      } else {
        playlist.musics = playlist.musics.filter(
          (music) => music.toString() !== musicId.toString()
        );
      }
    }

    await playlist.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlist Musics", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Playlist Musics" });
};

// 에러 처리 완료
// client
export const deletePlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const currentUserId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid Playlist ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!currentUserId) {
    res.status(404).send({
      ok: false,
      message: "No Login",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId).populate({
      path: "followers",
      select: "_id",
    });
  } catch (error) {
    // 처리 필요
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Failed Playlist", error: true });
    return;
  }

  // 처리 필요
  if (!playlist) {
    res.status(422).send({
      ok: false,
      message: "No Playlist",
      error: false,
      type: "NO_DATA",
    });
    return;
  }

  // 처리 필요
  if (!playlist.user.equals(currentUserId)) {
    res.status(422).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  try {
    const owner = await User.findById(currentUserId);
    if (!owner) {
      // 처리 필요
      res.status(422).send({
        ok: false,
        message: "No Owner Found",
        error: false,
        type: "NO_DATA",
      });
      return;
    }

    owner.playlists = owner.playlists.filter(
      (item) => !item.equals(playlist._id)
    );
    await owner.save();
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({
      ok: false,
      message: "DB Error Removing from Owner",
      error: true,
    });
    return;
  }

  try {
    const followerIds = playlist.followers.map((follower) => follower._id);

    if (followerIds.length > 0) {
      const followers = await User.find({ _id: { $in: followerIds } });

      for (const follower of followers) {
        follower.followings.followingPlaylists = follower.followings.followingPlaylists.filter(
          (item) => item.toString() !== playlist._id.toString()
        );
      }

      await Promise.all(followers.map((follower) => follower.save()));
    }
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({
      ok: false,
      message: "DB Error Removing from Followers",
      error: true,
    });
    return;
  }

  try {
    await playlist.deleteOne();
  } catch (error) {
    console.log(error);
    // 처리 필요
    res
      .status(500)
      .send({ ok: false, message: "DB Error Deleting Playlist", error: true });
    return;
  }
  res.status(200).send({ ok: true, message: "Delete Playlist" });
};
