import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", ReviewSchema);