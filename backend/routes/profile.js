import express from "express";
import auth from "../middleware/auth.js";
import Student from "../models/Student.js";
import Landlord from "../models/Landlord.js";
import { LoginActivity } from "../models/LoginActivity.js";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET profile (role-aware)
router.get("/me", auth, async (req, res) => {
  const Model = req.user.role === "landlord" ? Landlord : Student;
  const user = await Model.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: { ...user.toObject(), role: req.user.role } });
});

// UPDATE profile (role-aware)
router.put("/update", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePicture = req.file.filename;

    const Model = req.user.role === "landlord" ? Landlord : Student;
    const user = await Model.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { ...user.toObject(), role: req.user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CHANGE PASSWORD (role-aware)
router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const Model = req.user.role === "landlord" ? Landlord : Student;
    const user = await Model.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// VIEW LOGIN ACTIVITY
router.get("/activity", auth, async (req, res) => {
  try {
    const activities = await LoginActivity.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE ACCOUNT (role-aware)
router.delete("/delete", auth, async (req, res) => {
  try {
    const Model = req.user.role === "landlord" ? Landlord : Student;
    await Model.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
