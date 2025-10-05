import express from "express";
import auth from "../middleware/auth.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { getIO } from "../socket.js";

const router = express.Router();

// Get all payments for logged-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a payment
router.post("/", auth, async (req, res) => {
  const { description, amount, status } = req.body;
  try {
    const payment = await Payment.create({
      user: req.user.id,
      description,
      amount,
      status,
    });
    try {
      getIO().emit("payments:created", payment);
    } catch {}
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get payments for student
router.get("/student", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ 
      studentId: req.user.id 
    })
    .populate("propertyId", "title address")
    .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error("Error fetching student payments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payments for landlord (all payments for their properties)
router.get("/landlord", auth, async (req, res) => {
  try {
    // First find all rooms belonging to this landlord
    const landlordRooms = await Room.find({ landlord: req.user.id });
    const roomIds = landlordRooms.map(room => room._id);
    
    // Then find all payments related to bookings for those rooms
    const bookings = await Booking.find({ propertyId: { $in: roomIds } });
    const bookingIds = bookings.map(booking => booking._id);
    
    const payments = await Payment.find({ 
      bookingId: { $in: bookingIds }
    })
    .populate("studentId", "name email")
    .populate("propertyId", "title address")
    .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error("Error fetching landlord payments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
