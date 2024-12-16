import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface IPlaylist extends Document {
  title: string;
  user: Types.ObjectId;
  musics?: Array<Types.ObjectId>;
  duration: number;
  introduction?: string;
  comments?: Array<Types.ObjectId>;
  created_at: Date;
  followers?: Array<Types.ObjectId>;
}

const PlaylistSchema: Schema = new Schema({
  title: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", required: true },
  musics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSMusic", default: [] },
  ],
  duration: { type: Number, default: 0 },
  introduction: { type: String, default: "" },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  created_at: { type: Date, default: Date.now() },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", default: [] },
  ],
});

const Playlist = mongoose.model<IPlaylist>("PSPlaylist", PlaylistSchema);

export default Playlist;
