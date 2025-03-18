import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/PSUser";
import bcrypt from "bcryptjs";
import { usernameGenerator } from "../lib/usernameGenerator";
import mongoose from "mongoose";
import { tokenGeneratorInCookie } from "../lib/tokenGeneratorInCookie";

const generateMultipleNicknames = (count: number) => {
  const nicknames = [];
  while (nicknames.length < count) {
    const nickname = usernameGenerator();
    if (!nicknames.includes(nickname)) {
      nicknames.push(nickname);
    }
  }
  return nicknames;
};

const checkMultipleNicknamesExistence = async (nicknames: string[]) => {
  const existingUsers = await User.find({ username: { $in: nicknames } });
  const existingNicknames = existingUsers.map((user) => user.username);
  return existingNicknames;
};

// 에러 처리 완료
export const emailValidate = async (req: Request, res: Response) => {
  const { value } = req.body;

  try {
    const isUserExists = await User.exists({ email: value });
    res
      .status(200)
      .send({ ok: true, message: "Validate Email", flag: !!isUserExists });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error User" });
    return;
  }
};

// 에러 처리 완료
export const signIn = async (req: Request, res: Response) => {
  const {
    data: { email, password, passwordConfirm },
  } = req.body;

  // // 요청 횟수 확인
  // console.log("fetch");

  // // 임의로 요청 딜레이 설정
  // await new Promise((resolve) => setTimeout(resolve, 12000));

  if (password !== passwordConfirm) {
    res.status(200).send({
      ok: false,
      message: "비밀번호를 확인해주세요.",
      error: false,
      type: "password",
    });
    return;
  }

  let user = null;

  try {
    user = await User.exists({ email });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  if (user) {
    res.status(200).send({
      ok: false,
      message: "이미 사용 중인 이메일입니다.",
      error: false,
      type: "email",
    });
    return;
  }

  //// 사용자 이름 생성 코드
  let nicknames = generateMultipleNicknames(10); // 10개의 후보 생성
  let existingNicknames = await checkMultipleNicknamesExistence(nicknames);

  // 중복이 있는 경우 다시 시도
  while (existingNicknames.length > 0) {
    nicknames = generateMultipleNicknames(10);
    existingNicknames = await checkMultipleNicknamesExistence(nicknames);
  }

  const username = nicknames[0];

  let encryptedPassword = password;

  try {
    encryptedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .send({ ok: false, message: "Password Hash Error", error: true });
    return;
  }

  try {
    await User.create({
      email,
      username,
      password: encryptedPassword,
      isSocial: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", erorr: true });
    return;
  }

  res.status(200).send({ ok: true, message: "SignIn" });
};

// 에러 처리 완료
export const login = async (req: Request, res: Response) => {
  const {
    data: { email, password },
  } = req.body;

  let user = null;

  try {
    user = await User.findOne({ email }, { password: 1 });

    if (!user) {
      res.status(200).send({ ok: false, message: "No User", error: false });
      return;
    }

    let isPasswordRight = false;

    try {
      isPasswordRight = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.log(error);
      res.status(500).send({ ok: false, message: "DB Error", error: true });
      return;
    }

    if (!isPasswordRight) {
      res
        .status(200)
        .send({ ok: false, message: "Password Error", error: false });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  tokenGeneratorInCookie(res, user._id);

  res.status(200).send({
    ok: true,
    message: "Login",
    userId: user._id,
  });
};

export const logOut = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).send({ ok: true, message: "LogOut" });
};

export const getSession = (req: Request, res: Response) => {
  if (req.userId === null) {
    // 로그인하지 않은 사용자에 대한 응답
    res.status(200).send({
      ok: true,
      message: "로그인하지 않은 사용자",
      userId: null,
      error: true,
    });
    return;
  }

  const userId = req.userId;

  // 사용자 정보는 DB에서 가져오거나 필요한 데이터를 반환
  res.status(200).send({ ok: true, message: "Get User ID", userId });
};

// 로컬 로그인 이메일과 구글 이메일이 같을 경우 해결 필요
// 기존 사용자 이름과 구글 정보의 사용자 이름이 같을 경우 해결 필요
export const googleLogin = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  let info = null;

  try {
    info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(422).send({ message: "Login Error", ok: false });
    return;
  }

  let user = null;

  if (info) {
    const username = info.name + "/google";
    const email = info.email + "/google";

    try {
      user = await User.findOne({ email });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ ok: false, message: "DB Error User", error: true });
      return;
    }

    if (user) {
      // 로그인
      tokenGeneratorInCookie(res, user._id);

      res.status(200).send({
        ok: true,
        message: "Social Login",
        userId: user._id,
      });
      return;
    } else {
      // 새로 생성
      let password = info.id;

      try {
        password = await bcrypt.hash(info.id, 10);
      } catch (error) {
        console.log(error);
        res.status(404).send({ ok: false, message: "Password Hash Error" });
        return;
      }

      try {
        user = await User.create({
          email,
          username,
          password,
          isSocial: true,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({ ok: false, message: "DB Error" });
        return;
      }

      tokenGeneratorInCookie(res, user._id);

      res.status(200).send({
        ok: true,
        message: "Social SignIn and Login",
        userId: user._id,
      });
      return;
    }
  } else {
    res.status(422).send({ message: "Login Error", ok: false });
    return;
  }
};

export const getAdmin = async (req: Request, res: Response) => {
  if (req.userId === null) {
    // 로그인하지 않은 사용자에 대한 응답
    res.status(200).send({
      ok: true,
      message: "로그인하지 않은 사용자",
      userId: null,
    });
    return;
  }

  const userId = req.userId;

  let user = null;

  try {
    user = await User.findById(userId);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  if (!user) {
    res.status(422).send({ ok: false, message: "No User" });
    return;
  }

  res
    .status(200)
    .send({ ok: true, message: "Get User Admin", isAdmin: user.isAdmin });
};

// 에러 처리 완료
export const checkPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
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

  let isPasswordRight = false;

  try {
    isPasswordRight = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", error: true });
    return;
  }

  if (!isPasswordRight) {
    res.status(200).send({
      ok: false,
      message: "Password Error",
      error: false,
      type: "USER",
    });
    return;
  }

  res.status(200).send({ ok: true, message: "Check Password" });
};

export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(200).json({ message: "Refresh Token이 없습니다.", ok: false });
    return;
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      res
        .status(403)
        .json({ message: "유효하지 않은 Refresh Token입니다.", ok: false });
      return;
    }

    const userId = (decoded as { userId: string }).userId;

    // 새로운 accessToken 발급
    const newAccessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000, // 1시간
      sameSite: "none",
    });
    res.status(200).send({ message: "New AccessToken", ok: true });
    return;
  });
};
