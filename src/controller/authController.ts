import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/PSUser";
import bcrypt from "bcryptjs";

const JWT_SECRET = "maga_jwt_secret_7218";

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

// 같은 사용자이름 validate 필요, 소셜 로그인 때문에 입력 validate 철저하게
export const signIn = async (req: Request, res: Response) => {
  const {
    data: { email, username, password, passwordConfirm },
  } = req.body;

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
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: "DB Error", erorr: true });
    return;
  }

  res.status(200).send({ ok: true, message: "SignIn Success" });
};

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

// 같은 사용자 이름 validate 필요
export const googleLogin = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  let info;

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
    const username = info.id + "/g";
    const email = info.email + "/google";

    user = await User.findOne({ email });

    if (user) {
      console.log("로그인");

      // 로그인
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
        message: "Social Login Success",
        userId: user._id,
      });
      return;
    } else {
      console.log("새로 생성");
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
        });
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
        message: "Social SignIn & Login Success",
        userId: user._id,
      });
      return;
    }
  }
};
