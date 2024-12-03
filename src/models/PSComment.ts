import mongoose, { Document, Schema, Model, Types } from "mongoose";

interface IComment extends Document {
  payload: string;
  user: Types.ObjectId;
  created_at: Date;
  likes: number;
}

const CommentSchema: Schema = new Schema({
  payload: { type: String, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  created_at: { type: Date, default: Date.now() },
  likes: { type: Number, default: 0 },
});

const Comment = mongoose.model<IComment>("PSComment", CommentSchema);

export default Comment;
