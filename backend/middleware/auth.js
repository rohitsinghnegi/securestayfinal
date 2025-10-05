import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Landlord from "../models/Landlord.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token, authorization denied" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    let user;
    if (decoded.role === "student") {
      user = await Student.findById(decoded.id).select("-password");
    } else if (decoded.role === "landlord") {
      user = await Landlord.findById(decoded.id).select("-password");
    } else {
      return res.status(401).json({ 
        success: false,
        message: "Invalid user role in token" 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: decoded.role,
      profilePicture: user.profilePicture,
      ...user.toObject()
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Server error in authentication" 
    });
  }
};

export default auth;