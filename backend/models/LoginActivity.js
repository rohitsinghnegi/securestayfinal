import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  action: { type: String, default: "login" }, // you can extend to "update-profile", etc.
});

export const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
