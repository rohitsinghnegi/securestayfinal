import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
}, { timestamps: true });

// Ensure unique combination of user and property
BookmarkSchema.index({ user: 1, property: 1 }, { unique: true });

export default mongoose.model("Bookmark", BookmarkSchema);
