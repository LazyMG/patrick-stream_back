import { Request, Response } from "express";
import User from "../models/PSUser";
import Playlist from "../models/PSPlaylist";
import Music from "../models/PSMusic";
import { populate } from "dotenv";

// 다른 사용자 페이지 들어갈 때는 정보 가려서 보내기기
export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  let user = null;

  if (userId === currentUserId) {
    // console.log("myPage!");
  }

  try {
    user = await User.findById(userId)
      .populate({
        path: "recentMusics",
        select: "coverImg title ytId released_at counts duration",
        populate: [
          {
            path: "artists",
            select: "_id artistname coverImg",
          },
          {
            path: "album",
            select: "_id title coverImg",
          },
        ],
      })
      .populate({
        path: "likedMusics",
        select: "coverImg title ytId released_at counts duration",
        populate: [
          {
            path: "artists",
            select: "_id artistname coverImg",
          },
          {
            path: "album",
            select: "_id title coverImg",
          },
        ],
      })
      .populate({
        path: "followings.followingArtists",
        select: "_id artistname coverImg followers",
      })
      .populate({
        path: "followings.followingAlbums",
        select: "_id title coverImg followers released_at category",
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
      path: "playlists",
      select: "_id title duration introduction followers",
      populate: [
        {
          path: "user",
          select: "_id username",
        },
        {
          path: "musics",
          select: "_id ytId coverImg counts title duration released_at",
          populate: [
            {
              path: "artists",
              select: "_id artistname coverImg",
            },
            {
              path: "album",
              select: "_id title released_at coverImg",
            },
          ],
        },
      ],
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

  res.status(200).send({
    ok: true,
    message: "Get Playlists Success",
    playlists: user.playlists,
  });
};

export const updateUserRecentMusics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { musicId } = req.body;
  const currentUserId = req.userId;

  if (userId !== currentUserId) {
    res.status(200).send({ ok: false, message: "No Login User" });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId).populate({
      path: "recentMusics",
      select: "_id ytId",
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
    if (user.recentMusics.some((item) => item._id.equals(music._id))) {
      const newList = user.recentMusics.filter(
        (item) => !item._id.equals(music._id)
      );
      user.recentMusics = [music._id, ...newList];
    } else {
      user.recentMusics.push(music._id);
    }
    await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User Music" });
    return;
  }

  res.status(200).send({ ok: true, message: "Add User RecentMusics" });
};

export const updateLikedMusics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { addMusic, musicId } = req.body;

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
    if (addMusic) {
      const isAlreadyLiked = user.likedMusics.some((likedMusic) =>
        likedMusic._id.equals(musicId)
      );
      if (!isAlreadyLiked) {
        user.likedMusics.push(music._id);
        music.counts.likes += 1;
      }
    } else {
      user.likedMusics = user.likedMusics.filter(
        (likedMusic) => !likedMusic._id.equals(musicId)
      );
      if (music.counts.likes > 0) {
        music.counts.likes = Math.max(music.counts.likes - 1, 0);
      }
    }
    await Promise.all([user.save(), music.save()]);
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error User with Music" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update Likes" });
};

export const updateUserFollowers = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { activeUserId, addList } = req.body;

  let targetUser = null;

  try {
    targetUser = await User.findById(userId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Target User" });
    return;
  }

  if (!targetUser) {
    res.status(422).send({ ok: false, message: "No Target User" });
    return;
  }

  let activeUser = null;

  try {
    activeUser = await User.findById(activeUserId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Active User" });
    return;
  }

  if (!activeUser) {
    res.status(422).send({ ok: false, message: "No Target Active User" });
    return;
  }

  try {
    if (addList) {
      if (!targetUser.followers.some((user) => user._id.equals(activeUserId))) {
        targetUser.followers.push(activeUserId);
      }
      if (
        !activeUser.followings.followingUsers.some((user) =>
          user._id.equals(userId)
        )
      ) {
        activeUser.followings.followingUsers.push(userId);
      }
    } else {
      if (targetUser.followers.some((user) => user._id.equals(activeUserId))) {
        targetUser.followers = targetUser.followers.filter(
          (user) => !user._id.equals(activeUserId)
        );
      }
      if (
        activeUser.followings.followingUsers.some((user) =>
          user._id.equals(userId)
        )
      ) {
        activeUser.followings.followingUsers = activeUser.followings.followingUsers.filter(
          (user) => !user._id.equals(userId)
        );
      }
    }
    await Promise.all([targetUser.save(), activeUser.save()]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Update Users" });
    return;
  }

  res.status(200).send({ ok: true, message: "Update List" });
};
