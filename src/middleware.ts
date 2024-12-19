import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "maga_jwt_secret_7218"; // 환경 변수로 관리하는 것이 좋음

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    // 로그인하지 않은 사용자의 경우
    req.userId = null; // 사용자 ID를 null로 설정
    return next(); // 계속 진행하여 로그인하지 않은 사용자 처리
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // 토큰이 유효하지 않으면 로그인하지 않은 사용자로 처리
      req.userId = null;
      return next(); // 계속 진행하여 로그인하지 않은 사용자 처리
    }

    // 유효한 토큰이 있을 경우 로그인한 사용자 정보 설정
    req.userId = decoded?.userId;
    next();
  });
};
