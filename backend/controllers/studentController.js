import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash, role: "student" });
  await user.save();
  res.status(201).json({ message: "Student registered" });
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "student" });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user });
};