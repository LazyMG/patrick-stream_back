import { Request, Response } from "express";

export const uploadMusic = async (req: Request, res: Response) => {
  console.log(req.body);
};
