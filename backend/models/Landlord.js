import mongoose from "mongoose";

const landlordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    role: { type: String, default: "landlord" },
    verified: { type: Boolean, default: false },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Landlord", landlordSchema);
