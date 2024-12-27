import { Request, Response } from "express";
import Playlist from "../models/PSPlaylist";
import User from "../models/PSUser";

export const getPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params;

  let playlist = null;

  try {
    playlist = await Playlist.findById(playlistId)
      .populate({
        path: "musics",
        select: "_id title artists album duration counts ytId coverImg",
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
    res.status(422).send({ ok: false, message: "No Playlist" });
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
