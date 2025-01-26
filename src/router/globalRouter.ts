import express from "express";
import { getSearchData } from "../controller/globalController";

export const globalRouter = express.Router();

globalRouter.get("/search", getSearchData);
