import express from "express";
import auth from "../middleware/auth.js";
import Bookmark from "../models/Bookmark.js";
import Room from "../models/Room.js";

const router = express.Router();

// Get all bookmarks for the logged-in student
router.get("/student", auth, async (req, res) => {
  try {
    // First, clean up any bookmarks with null property references
    await Bookmark.deleteMany({ user: req.user.id, property: null });
    
    const bookmarks = await Bookmark.find({ user: req.user.id }).populate("property");
    
    // Map Room data to Property-like structure expected by frontend
    const mappedBookmarks = bookmarks
      .filter(b => b.property) // Filter out bookmarks with null property
      .map((b) => {
        const room = b.property;
        
        return {
          id: room._id.toString(),
          _id: room._id,
          title: room.title,
          location: room.address || `${room.location?.city || ''}, ${room.location?.state || ''}`,
          price: room.pricePerMonth,
          image: room.images?.[0] || '',
          images: room.images || [],
          rating: room.rating || 0,
          reviewCount: room.reviewCount || 0,
          verified: true, // Can add logic here if verification exists
          amenities: room.amenities || [],
          type: room.roomType,
        };
      });
    
    res.json(mappedBookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks", details: error.message });
  }
});

// Toggle bookmark
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Check if the room/property exists
    const room = await Room.findById(propertyId);
    if (!room) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if bookmark already exists
    let bookmark = await Bookmark.findOne({ user: req.user.id, property: propertyId });
    
    if (bookmark) {
      // Remove bookmark
      await bookmark.deleteOne();
      return res.json({ bookmarked: false, message: "Bookmark removed" });
    }

    // Add new bookmark
    bookmark = new Bookmark({ user: req.user.id, property: propertyId });
    await bookmark.save();
    await bookmark.populate("property");

    res.json({ bookmarked: true, message: "Bookmark added", property: bookmark.property });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ 
      error: "Failed to toggle bookmark",
      details: error.message 
    });
  }
});

// Remove bookmark by property ID
router.delete("/:propertyId", auth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const bookmark = await Bookmark.findOneAndDelete({ user: req.user.id, property: propertyId });

    if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
