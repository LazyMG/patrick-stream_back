import { Request, Response } from "express";

export const signIn = async (req: Request, res: Response) => {
  const {
    data: { email, username, password, passwordConfirm },
  } = req.body;

  //사용자 찾기, 등록록

  res.status(200).send({ ok: true, message: "SignIn Success" });
};

export const login = async (req: Request, res: Response) => {
  const {
    data: { email, password },
  } = req.body;

  console.log(email, password);

  //사용자 찾기

  let user = {
    username: "maga",
    id: 123,
  };

  res
    .status(200)
    .send({ ok: true, message: "Login Success", user, isLoggedIn: true });
};
