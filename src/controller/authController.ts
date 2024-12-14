import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/PSUser";
import bcrypt from "bcryptjs";

const JWT_SECRET = "maga_jwt_secret_7218";

export const signIn = async (req: Request, res: Response) => {
  const {
    data: { email, username, password, passwordConfirm },
  } = req.body;

  //사용자 찾기, 등록
  if (password !== passwordConfirm) {
    res.status(422).send({ ok: false, message: "Password Error" });
    return;
  }

  let user = null;

  try {
    user = await User.exists({ email });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  if (user) {
    res.status(200).send({ ok: false, message: "Email Already Exist" });
    return;
  }

  let encryptedPassword = password;

  try {
    encryptedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error);
    res.status(404).send({ ok: false, message: "Password Hash Error" });
    return;
  }

  try {
    await User.create({
      email,
      username,
      password: encryptedPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  res.status(200).send({ ok: true, message: "SignIn Success" });
};

export const login = async (req: Request, res: Response) => {
  const {
    data: { email, password },
  } = req.body;

  console.log(email, password);

  //사용자 찾기

  let user = null;

  try {
    user = await User.findOne({ email }, { password: 1 });

    if (!user) {
      res.status(422).send({ ok: false, message: "No User" });
      return;
    }

    let isPasswordRight = false;

    try {
      isPasswordRight = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.log(error);
      res.status(500).send({ ok: false, message: "DB Error" });
      return;
    }

    if (!isPasswordRight) {
      res.status(422).send({ ok: false, message: "Password Error" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  // secure 수정 필요
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 3600000, // 1시간
    // maxAge: 10000,
  });

  res.status(200).send({
    ok: true,
    message: "Login Success",
    isLoggedIn: true,
    userId: user._id,
  });
};

export const logOut = (req: Request, res: Response) => {
  // secure 수정 필요
  res.clearCookie("token", { httpOnly: true, secure: false });
  res.status(200).send({ ok: true, message: "LogOut Success" });
};

export const getSession = (req: Request, res: Response) => {
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

  // 사용자 정보는 DB에서 가져오거나 필요한 데이터를 반환
  res.status(200).send({ ok: true, userId });
};
