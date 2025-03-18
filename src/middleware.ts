import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    // 로그인하지 않은 사용자의 경우
    req.userId = null; // 사용자 ID를 null로 설정
    return next(); // 계속 진행하여 로그인하지 않은 사용자 처리
  }

  // if (!token) {
  //   res.status(401).json({ message: "인증 토큰이 없습니다." });
  //   return;
  // }

  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err) {
  //     // 토큰이 유효하지 않으면 로그인하지 않은 사용자로 처리
  //     req.userId = null;
  //     return next(); // 계속 진행하여 로그인하지 않은 사용자 처리
  //   }

  //   // 유효한 토큰이 있을 경우 로그인한 사용자 정보 설정
  //   req.userId = decoded?.userId;
  //   next();
  // });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message:
            "토큰이 만료되었습니다. 다시 로그인하거나 새 토큰을 요청하세요.",
        });
      }
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }

    req.userId = (decoded as { userId: string }).userId;
    return next(); // 인증 성공 시 다음 미들웨어로 이동
  });
};
