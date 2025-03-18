import { Request, Response } from "express";
import Music from "../models/PSMusic";
import Artist from "../models/PSArtist";
import Album from "../models/PSAlbum";

// 에러 처리 완료
export const getSearchData = async (req: Request, res: Response) => {
  const { keyword } = req.query;

  if (!keyword) {
    res.status(200).json({ ok: false, message: "No Keyword", type: "NO_DATA" });
    return;
  }

  const [musics, albums, artists, exactResult] = await Promise.all([
    getSearchMusic(keyword.toString()),
    getSearchAlbum(keyword.toString()),
    getSearchArtist(keyword.toString()),
    getExactMatch(keyword.toString()),
  ]);

  res.status(200).send({
    ok: true,
    message: "Get Data",
    musics,
    albums,
    artists,
    exactResult,
  });
};

const getExactMatch = async (keyword: string) => {
  try {
    // 음악에서 검색 (likes 기준 정렬)
    const music = await Music.findOne({
      title: { $regex: `^${keyword}(\\s*\\(.*\\))*$`, $options: "i" },
    })
      .sort({ "counts.likes": -1 }) // 좋아요(likes) 순으로 정렬
      .populate({ path: "artists", select: "artistname" })
      .populate({ path: "album", select: "title" })
      .lean();

    if (music) return { type: "music", data: music };

    // 아티스트에서 검색 (followers 기준 정렬)
    const artist = await Artist.findOne({
      artistname: { $regex: `^${keyword}$`, $options: "i" },
    })
      .sort({ followers: -1 }) // 팔로워 수 기준 정렬
      .select("artistname coverImg followers")
      .populate({
        path: "musics",
        select: "coverImg title ytId counts album duration released_at",
        match: {
          $or: [
            { artists: { $exists: true, $ne: [] } },
            { album: { $exists: true, $ne: null } },
          ],
        },
        populate: [
          {
            path: "album",
            select: "title _id",
          },
          {
            path: "artists",
            select: "_id artistname",
          },
        ],
      })
      .lean();

    if (artist) return { type: "artist", data: artist };

    // 앨범에서 검색 (followers 기준 정렬)
    const album = await Album.findOne({
      title: { $regex: `^${keyword}$`, $options: "i" },
    })
      .sort({ followers: -1 }) // 팔로워 수 기준 정렬
      .populate({ path: "artists", select: "artistname" })
      .populate({
        path: "musics",
        select: "ytId title counts duration coverImg released_at",
        match: {
          $or: [
            { artists: { $exists: true, $ne: [] } },
            { album: { $exists: true, $ne: null } },
          ],
        },
        options: {
          sort: { index: 1 },
        },
        populate: [
          {
            path: "artists",
            select: "_id artistname",
          },
          {
            path: "album",
            select: "_id title",
          },
        ],
      })
      .lean();

    if (album) return { type: "album", data: album };

    return null; // 정확히 일치하는 데이터 없음
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getArtistIdsByName = async (keyword: string) => {
  const artists = await Artist.find({
    artistname: { $regex: new RegExp(keyword, "i") },
  }).select("_id");

  return artists.map((artist) => artist._id);
};

const getSearchMusic = async (keyword: string) => {
  try {
    const artistIds = await getArtistIdsByName(keyword);

    const musics = await Music.find({
      $or: [
        { title: { $regex: new RegExp(keyword, "i") } },
        { artists: { $in: artistIds } },
      ],
    })
      .populate({ path: "artists", select: "artistname" })
      .populate({ path: "album" })
      .lean();

    return musics || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getSearchAlbum = async (keyword: string) => {
  try {
    const artistIds = await getArtistIdsByName(keyword);

    const albums = await Album.find({
      $or: [
        { title: { $regex: new RegExp(keyword, "i") } },
        { artists: { $in: artistIds } },
      ],
    })
      .populate({ path: "artists", select: "artistname" })
      .lean();

    return albums || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getSearchArtist = async (keyword: string) => {
  let artists = null;

  try {
    artists = await Artist.find({
      $or: [{ artistname: { $regex: new RegExp(keyword, "i") } }],
    });
  } catch (error) {
    console.log(error);
    return [];
  }

  if (!artists) {
    return [];
  }

  return artists;
};
