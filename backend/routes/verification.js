import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";
import Verification from "../models/Verification.js";
import Student from "../models/Student.js";
import Tesseract from "tesseract.js";

const router = express.Router();

// Multer config for verification docs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]; 
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Invalid file type"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Submit or resubmit verification
router.post(
  "/submit",
  auth,
  upload.fields([
    { name: "collegeId", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "student") return res.status(403).json({ message: "Only students can submit verification" });
      const { studentId, collegeName, course, year } = req.body;
      if (!studentId || !collegeName || !course || !year) return res.status(400).json({ message: "Missing fields" });

      const collegeIdFile = req.files?.collegeId?.[0]?.filename;
      const aadhaarCardFile = req.files?.aadhaarCard?.[0]?.filename;
      if (!collegeIdFile || !aadhaarCardFile) return res.status(400).json({ message: "Documents are required" });

      // Basic college ID format validation (example: alphanumeric 4-20 chars)
      const collegeIdValid = /^[A-Za-z0-9_-]{4,20}$/.test(studentId);
      if (!collegeIdValid) return res.status(400).json({ message: "Invalid College ID format" });

      // OCR Aadhaar to extract possible number and name (best-effort)
      let ocrText = "";
      try {
        const result = await Tesseract.recognize(`uploads/${aadhaarCardFile}`, "eng");
        ocrText = result?.data?.text || "";
      } catch (e) {
        // continue with best effort
      }
      const aadhaarNumberMatch = ocrText.replace(/\s+/g, " ").match(/\b\d{4}\s\d{4}\s\d{4}\b/);
      const extractedAadhaar = aadhaarNumberMatch ? aadhaarNumberMatch[0].replace(/\s+/g, "") : undefined;

      // Optionally, try to match student name if available on req.user
      let nameMatches = true;
      if (req.user?.name && ocrText) {
        const nameParts = String(req.user.name).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 2);
        nameMatches = nameParts.every((p) => ocrText.toLowerCase().includes(p));
      }

      if (!nameMatches) return res.status(400).json({ message: "Name on Aadhaar does not match account name" });

      // Upsert verification for this student, reset status to pending
      const verification = await Verification.findOneAndUpdate(
        { student: req.user.id },
        { student: req.user.id, studentId, collegeName, course, year, collegeIdFile, aadhaarCardFile, status: "pending", reviewedAt: null, reviewerNote: undefined },
        { new: true, upsert: true }
      );

      // Store pointers in Student for quick access (optional, not authoritative)
      try {
        await Student.findByIdAndUpdate(req.user.id, {
          collegeName,
          collegeId: studentId,
          aadhaarFile: aadhaarCardFile,
          aadhaarNumber: extractedAadhaar,
        });
      } catch {}

      return res.json({ verification, extractedAadhaar });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get my verification status/data
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Only students have verification" });
    const verification = await Verification.findOne({ student: req.user.id });
    return res.json({ verification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;


