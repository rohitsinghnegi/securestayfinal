import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true }, // sparse avoids null dup error
    profilePicture: { type: String },
    verified: { type: Boolean, default: false },
    collegeName: { type: String },
    collegeId: { type: String },
    aadhaarNumber: { type: String },
    aadhaarFile: { type: String },
    selfieFile: { type: String },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
