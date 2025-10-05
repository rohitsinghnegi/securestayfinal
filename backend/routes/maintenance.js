import express from "express";
import auth from "../middleware/auth.js";
import Maintenance from "../models/Maintenance.js";
import { getIO } from "../socket.js";

const router = express.Router();

// Get all maintenance requests for logged-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const requests = await Maintenance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit new maintenance request
router.post("/", auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const request = await Maintenance.create({
      user: req.user.id,
      title,
      description,
    });
    try {
      getIO().emit("maintenance:created", request);
    } catch {}
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
