import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalPrice: Number,
  status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
