import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface IArtist extends Document {
  artistname: string;
  musics?: Array<Types.ObjectId>;
  albums?: Array<Types.ObjectId>;
  introduction?: string;
  comments?: Array<Types.ObjectId>;
  debut_at: string;
  country: string;
  followers?: Array<Types.ObjectId>;
  coverImg: string;
  created_at: Date;
}

const ArtistSchema: Schema = new Schema({
  artistname: { type: String, required: true },
  musics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSMusic", default: [] },
  ],
  albums: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSAlbum", default: [] },
  ],
  introduction: { type: String, default: "" },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  debut_at: { type: String, required: true },
  country: { type: String, required: true },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", default: [] },
  ],
  coverImg: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
});

const Artist = mongoose.model<IArtist>("PSArtist", ArtistSchema);

export default Artist;
