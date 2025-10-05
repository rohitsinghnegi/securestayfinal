import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Maintenance", maintenanceSchema);
