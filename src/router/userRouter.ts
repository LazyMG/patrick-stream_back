import express from "express";

export const userRouter = express.Router();

// 사용자 정보
userRouter.get("/:userId", () => {});

// 사용자의 재생목록
userRouter.get("/:userId/playlists", () => {});

// 사용자의 전체 재생목록
userRouter.get("/:userId/allPlaylists", () => {});

// 사용자가 좋아요 누른 음악
userRouter.get("/:userId/likedMusics", () => {});

// 사용자가 좋아요 누른 모든 음악
userRouter.get("/:userId/likedAllMusics", () => {});

// 사용자의 최근 음악
userRouter.get("/:userId/recentMusics", () => {});

// 사용자의 모든 최근 음악
userRouter.get("/:userId/recentAllMusics", () => {});

// 사용자의 팔로워 목록
userRouter.get("/:userId/followers", () => {});

// 사용자가 팔로우한 목록
userRouter.get("/:userId/followings", () => {});

// 사용자의 댓글
userRouter.get("/:userId/comments", () => {});

// 사용자가 좋아요 누른 댓글
userRouter.get("/:userId/likedComments", () => {});

// 새 사용자 생성
userRouter.post("/", () => {});
