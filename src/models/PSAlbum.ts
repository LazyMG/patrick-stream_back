import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface IAlbum extends Document {
  title: string;
  musics?: Array<Types.ObjectId>;
  artists?: Array<Types.ObjectId>;
  introduction?: string;
  comments?: Array<Types.ObjectId>;
  released_at: string;
  category: string;
  followers: Array<Types.ObjectId>;
  total_duration?: number;
  length: number;
  coverImg: string;
  created_at: Date;
}

const AlbumSchema: Schema = new Schema({
  title: { type: String, required: true },
  musics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSMusic", default: [] },
  ],
  artists: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSArtist", default: [] },
  ],
  introduction: { type: String, default: "" },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  released_at: { type: String, required: true },
  category: { type: String, required: true },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", default: [] },
  ],
  total_duration: { type: Number, default: 0 },
  length: { type: Number, required: true },
  coverImg: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
});

const Album = mongoose.model<IAlbum>("PSAlbum", AlbumSchema);

export default Album;
