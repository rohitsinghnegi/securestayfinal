import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    studentId: { type: String, required: true },
    collegeName: { type: String, required: true },
    course: { type: String, required: true },
    year: { type: String, required: true },
    collegeIdFile: { type: String, required: true },
    aadhaarCardFile: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending", index: true },
    reviewedAt: { type: Date },
    reviewerNote: { type: String },
  },
  { timestamps: true }
);

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;


