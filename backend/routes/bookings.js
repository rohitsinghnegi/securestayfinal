import express from "express";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import auth from "../middleware/auth.js";
import { getIO } from "../socket.js";

const router = express.Router();

// Create a booking
router.post("/", auth, async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24));
    const totalPrice = nights * room.pricePerNight;

    const booking = await Booking.create({
      room: room._id,
      user: req.user.id,
      checkIn,
      checkOut,
      totalPrice,
      status: "booked"
    });
    try {
      getIO().emit("bookings:created", booking);
    } catch {}
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get bookings for current user
router.get("/mine", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("room");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get bookings for student
router.get("/student", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate("propertyId", "title address location images")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching student bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get bookings for landlord (all bookings for their properties)
router.get("/landlord", auth, async (req, res) => {
  try {
    // First find all rooms belonging to this landlord
    const landlordRooms = await Room.find({ landlord: req.user.id });
    const roomIds = landlordRooms.map(room => room._id);
    
    // Then find all bookings for those rooms
    const bookings = await Booking.find({ propertyId: { $in: roomIds } })
      .populate("propertyId", "title address location images")
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching landlord bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
