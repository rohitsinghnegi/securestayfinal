import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Landlord from "../models/Landlord.js";
import auth from "../middleware/auth.js";

// Configure environment variables
dotenv.config({ path: './backend.env' });

const router = express.Router();

// UNIFIED REGISTER ENDPOINT
router.post("/register", async (req, res) => {
  try {
    const { role, name, email, password } = req.body;
    // Accept both phone and mobile from clients
    const phone = req.body.phone || req.body.mobile;

    // Validate required fields
    if (!role || !["student", "landlord"].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role specified. Must be 'student' or 'landlord'." 
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required." 
      });
    }

    // Check if user already exists
    let existingUser;
    if (role === "student") {
      existingUser = await Student.findOne({ email });
    } else {
      existingUser = await Landlord.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists." 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    let token;

    if (role === "student") {
      user = await Student.create({ 
        name, 
        email, 
        password: hashedPassword, 
        phone: phone || "" 
      });
    } else {
      user = await Landlord.create({ 
        name, 
        email, 
        password: hashedPassword, 
        phone: phone || "",
        role: "landlord" 
      });
    }

    // Create JWT token
    token = jwt.sign(
      { id: user._id, role }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: "7d" }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: role,
      profilePicture: user.profilePicture
    };

    res.status(201).json({ 
      success: true,
      token, 
      user: userResponse,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration.",
      error: err.message 
    });
  }
});

// UNIFIED LOGIN ENDPOINT
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: "Email, password, and role are required." 
      });
    }

    if (!["student", "landlord"].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role specified. Must be 'student' or 'landlord'." 
      });
    }

    let user;

    // Find user based on role
    if (role === "student") {
      user = await Student.findOne({ email });
    } else {
      user = await Landlord.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials." 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: "7d" }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: role,
      profilePicture: user.profilePicture
    };

    res.json({ 
      success: true,
      token, 
      user: userResponse,
      message: "Login successful"
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during login.",
      error: err.message 
    });
  }
});

// GET CURRENT USER ENDPOINT
router.get("/me", auth, (req, res) => {
  try {
    // The 'auth' middleware already attaches the user object to the request
    // Return user data without sensitive information
    const userResponse = {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      profilePicture: req.user.profilePicture
    };

    res.json({ 
      success: true,
      user: userResponse 
    });
  } catch (err) {
    console.error("Get Current User Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching user data.",
      error: err.message 
    });
  }
});

// LOGOUT ENDPOINT (optional - for frontend to clear token)
router.post("/logout", auth, (req, res) => {
  // In JWT, logout is handled on the client side by removing the token
  // This endpoint can be used for any server-side cleanup if needed
  res.json({ 
    success: true,
    message: "Logout successful" 
  });
});

export default router;