import { Request, Response } from "express";
import Playlist from "../models/PSPlaylist";
import User from "../models/PSUser";
import Music from "../models/PSMusic";
import mongoose from "mongoose";

export const getPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  let playlist = null;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
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
      })
      .populate({
        path: "user",
        select: "_id username",
      });
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  if (!playlist) {
    res.status(422).send({ ok: false, message: "No Playlist", error: false });
    return;
  }
  // console.log(playlist);
  res.status(200).send({ ok: true, message: "Get Playlist Success", playlist });
};

export const updatePlaylistFollowers = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { activeUserId, addList } = req.body;

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Playlist" });
    return;
  }

  if (!playlist) {
    res.status(422).send({ ok: false, message: "No Playlist" });
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
    res.status(500).send({ ok: false, message: "DB Error Playlist with User" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Playlist Followers" });
};

export const updatePlaylistMusics = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const { musicId, addMusic } = req.body;
  const currentUserId = req.userId;

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Playlist" });
    return;
  }

  if (!playlist) {
    res.status(422).send({ ok: false, message: "No Playlist" });
    return;
  }

  if (!playlist.user.equals(currentUserId)) {
    res
      .status(422)
      .send({ ok: false, message: "This is not a User's Playlist" });
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
    res.status(500).send({ ok: false, message: "DB Error Playlist Musics" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Playlist Musics" });
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;
  const currentUserId = req.userId;

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId).populate({
      path: "followers",
      select: "_id",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Failed Playlist" });
    return;
  }

  if (!playlist) {
    res.status(422).send({ ok: false, message: "No Playlist" });
    return;
  }

  if (!playlist.user.equals(currentUserId)) {
    res.status(422).send({ ok: false, message: "Access Denied" });
    return;
  }

  try {
    const owner = await User.findById(currentUserId);
    if (!owner) {
      res.status(422).send({ ok: false, message: "No Owner Found" });
      return;
    }

    owner.playlists = owner.playlists.filter(
      (item) => !item.equals(playlist._id)
    );
    await owner.save();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Removing from Owner" });
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
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Removing from Followers" });
    return;
  }

  try {
    await playlist.deleteOne();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Deleting Playlist" });
    return;
  }
  res.status(200).send({ ok: true, message: "Delete Playlist" });
};
