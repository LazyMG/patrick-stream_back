import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface Following {
  followingUsers: Array<Types.ObjectId>;
  followingPlaylists: Array<Types.ObjectId>;
  followingAlbums: Array<Types.ObjectId>;
  followingArtists: Array<Types.ObjectId>;
}

interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  introduction?: string;
  isAdmin?: boolean;
  likedMusics?: Array<Types.ObjectId>;
  recentMusics?: Array<Types.ObjectId>;
  playlists?: Array<Types.ObjectId>;
  comments?: Array<Types.ObjectId>;
  followers?: Array<Types.ObjectId>;
  followings?: Following;
  created_at: Date;
  likedComments: Array<Types.ObjectId>;
  isSocial: boolean;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  introduction: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  likedMusics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSMusic", default: [] },
  ],
  recentMusics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSMusic", default: [] },
  ],
  playlists: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSPlaylist", default: [] },
  ],
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", default: [] },
  ],
  followings: {
    followingUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PSUser", default: [] },
    ],
    followingPlaylists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PSPlaylist", default: [] },
    ],
    followingAlbums: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PSAlbum", default: [] },
    ],
    followingArtists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PSArtist", default: [] },
    ],
  },
  created_at: { type: Date, default: Date.now() },
  likedComments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PSComment", default: [] },
  ],
  isSocial: { type: Boolean, required: true },
});

const User = mongoose.model<IUser>("PSUser", UserSchema);

export default User;
