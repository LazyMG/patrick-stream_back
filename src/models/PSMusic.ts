import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface Count {
  likes: number;
  views: number;
}

// 인터페이스 정의 (Document 타입 확장)
interface IMusic extends Document {
  title: string;
  artists?: Array<Types.ObjectId>;
  album?: Types.ObjectId;
  duration: number; // 초 단위
  counts: Count;
  ytId: string;
  comments?: Array<Types.ObjectId>;
  released_at: string;
  genre: Array<
    | "Solo"
    | "Group"
    | "Man"
    | "Woman"
    | "Dance"
    | "Pop"
    | "Ballad"
    | "Hiphop"
    | "Band"
    | "KPop"
  >;
  coverImg: string;
  created_at: Date;
  index?: number;
}

const MusicSchema: Schema = new Schema({
  title: { type: String, required: true },
  artists: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSArtist", default: [] },
  ],
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PSAlbum",
  },
  duration: { type: Number, required: true },
  counts: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  ytId: { type: String, required: true, unique: true },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  released_at: { type: String, required: true },
  coverImg: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
  genre: [{ type: String, required: true }],
  index: { type: Number, default: 0 },
});

const Music = mongoose.model<IMusic>("PSMusic", MusicSchema);

export default Music;
