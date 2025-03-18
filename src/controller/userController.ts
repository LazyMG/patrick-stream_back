import { Request, Response } from "express";
import User from "../models/PSUser";
import Playlist from "../models/PSPlaylist";
import Music from "../models/PSMusic";
import mongoose from "mongoose";

// 에러 처리 완료
// 다른 사용자 페이지 들어갈 때는 정보 가려서 보내기
// client
export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  let user = null;

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  // 자신이 아닌 다른 사용자일 경우
  if (userId !== currentUserId) {
    try {
      user = await User.findById(userId)
        .select("-password")
        .populate({
          path: "playlists",
          select: "_id title followers user",
          populate: {
            path: "user",
            select: "_id username",
          },
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ ok: false, message: "DB Failed", error: true });
      return;
    }
    res.status(200).send({ ok: true, message: "Get User", user });
    return;
  }

  try {
    user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "recentMusics",
        select: "coverImg title ytId released_at counts duration",
        match: {
          $and: [
            { artists: { $exists: true, $not: { $size: 0 } } },
            { album: { $exists: true, $ne: null } },
          ],
        },
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
        match: {
          $and: [
            { artists: { $exists: true, $not: { $size: 0 } } },
            { album: { $exists: true, $ne: null } },
          ],
        },
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
        select: "_id title coverImg followers released_at category artists",
        populate: {
          path: "artists",
          select: "_id artistname",
        },
        match: {
          artists: { $exists: true, $not: { $size: 0 } },
        },
      })
      .populate({
        path: "followings.followingPlaylists",
        select: "_id title followers",
      });
  } catch (error) {
    // 처리 완료
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Failed", error: true });
    return;
  }

  // 처리 완료
  if (!user) {
    res
      .status(422)
      .send({ ok: false, message: "No User", error: false, type: "NO_DATA" });
    return;
  }
  res.status(200).send({ ok: true, message: "Get User", user });
};

// 에러 처리 완료
// client
export const createUserPlaylist = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const {
    data: { info, title },
  } = req.body;
  const currentUserId = req.userId;

  // 처리 완료
  if (!currentUserId) {
    res.status(404).send({
      ok: false,
      message: "Access Denied",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  // 처리 완료
  if (!title) {
    res.status(200).send({
      ok: false,
      message: "Input No Title",
      error: false,
      type: "NO_INPUT",
    });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    // 처리 완료
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  // 처리 완료
  if (!user) {
    res
      .status(422)
      .send({ ok: false, message: "No User", error: false, type: "NO_DATA" });
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
    // 처리 완료
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Playlist", error: true });
    return;
  }

  try {
    user.playlists = [playlist._id, ...user.playlists];
    await user.save();
  } catch (error) {
    // 처리 완료
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error User add Playlist", error: true });
    return;
  }

  res
    .status(200)
    .send({ ok: true, message: "Create Playlist", id: playlist._id });
};

// 에러 처리 완료
// client
export const getUserAllPlaylists = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  if (!currentUserId) {
    res.status(200).send({
      ok: true,
      message: "Get Playlists Success",
      playlists: [],
    });
    return;
  }

  // 처리 완료
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

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
    // 처리 완료
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  // 처리 완료
  if (!user) {
    res
      .status(422)
      .send({ ok: false, message: "No User", error: false, type: "NO_DATA" });
    return;
  }

  res.status(200).send({
    ok: true,
    message: "Get User Playlists",
    playlists: user.playlists,
  });
};

// 처리 X
// client
export const updateUserRecentMusics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { musicId } = req.body;
  const currentUserId = req.userId;

  // 처리 필요
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid music ID format",
      error: false,
    });
    return;
  }

  // 처리 필요
  if (userId !== currentUserId) {
    res.status(200).send({ ok: false, message: "No Login User", error: false });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId).populate({
      path: "recentMusics",
      select: "_id ytId",
    });
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  // 처리 필요
  if (!user) {
    res.status(422).send({ ok: false, message: "No User", error: false });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  // 처리 필요
  if (!music) {
    res.status(422).send({ ok: false, message: "No Music", error: false });
    return;
  }

  try {
    if (user.recentMusics.some((item) => item._id.equals(music._id))) {
      const newList = user.recentMusics.filter(
        (item) => !item._id.equals(music._id)
      );
      user.recentMusics = [music._id, ...newList];
    } else {
      user.recentMusics = [music._id, ...user.recentMusics];
    }
    await user.save();
  } catch (error) {
    // 처리 필요
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error User Music", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Add User RecentMusics" });
};

// 처리 X
// client
export const updateLikedMusics = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { addMusic, musicId } = req.body;

  // 처리 필요
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(musicId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid music ID format",
      error: false,
    });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User", error: true });
    return;
  }

  // 처리 필요
  if (!user) {
    res.status(422).send({ ok: false, message: "No User", error: false });
    return;
  }

  let music = null;

  try {
    music = await Music.findById(musicId);
  } catch (error) {
    // 처리 필요
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error Music", error: true });
    return;
  }

  // 처리 필요
  if (!music) {
    res.status(422).send({ ok: false, message: "No Music", error: false });
    return;
  }

  try {
    if (addMusic) {
      const isAlreadyLiked = user.likedMusics.some((likedMusic) =>
        likedMusic._id.equals(musicId)
      );
      if (!isAlreadyLiked) {
        user.likedMusics = [music._id, ...user.likedMusics];
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
    // 처리 필요
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error User with Music", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update User LikedMusics" });
};

// 에러 처리 완료
// client
export const updateUserFollowers = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { activeUserId, addList } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(activeUserId)) {
    res.status(404).send({
      ok: false,
      message: "Invalid user ID format",
      error: false,
      type: "ERROR_ID",
    });
    return;
  }

  let targetUser = null;

  try {
    targetUser = await User.findById(userId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ ok: false, message: "DB Error Target User", error: true });
    return;
  }

  if (!targetUser) {
    res.status(422).send({
      ok: false,
      message: "No Target User",
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
    res
      .status(500)
      .send({ ok: false, message: "DB Error Active User", error: true });
    return;
  }

  if (!activeUser) {
    res.status(422).send({
      ok: false,
      message: "No Target Active User",
      error: false,
      type: "NO_DATA",
    });
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
    res
      .status(500)
      .send({ ok: false, message: "DB Error Update Users", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Update User Followers" });
};

// 에러 처리 완료
// client
export const updateUserInfo = async (req: Request, res: Response) => {
  const { username } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(404).send({
      ok: false,
      message: "No Login",
      error: false,
      type: "NO_ACCESS",
    });
    return;
  }

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  if (!user) {
    res
      .status(422)
      .send({ ok: false, message: "No User", error: false, type: "NO_DATA" });
    return;
  }

  let checkUser = null;

  try {
    checkUser = await User.exists({ username });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  if (checkUser) {
    res.status(200).send({
      ok: false,
      message: "이미 사용 중인 이름입니다.",
      error: false,
      type: "INVALID_NAME",
    });
    return;
  }

  try {
    user.username = username;
    await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  res.status(200).send({ ok: true, message: "Change User Info" });
};
