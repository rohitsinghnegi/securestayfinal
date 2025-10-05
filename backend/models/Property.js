import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],
  type: String,
  rating: Number,
  reviewCount: Number,
  verified: Boolean,
  amenities: [String],
});

export default mongoose.model("Property", PropertySchema);
