import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.js";

dotenv.config();

export const signup = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error:
          "Missing required fields: name, email, and password are required",
      });
    }

    // Set default role if not provided
    const userRole = role || "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashPassword,
      role: userRole,
    };

    const user = new User(userData);

    await user
      .save()
      .then(() => {
        res.status(201).json({ message: "User created successfully" });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login Request Body:", req.body);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email and password are required",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if role matches (if role is provided in login)
    if (role && user.role !== role) {
      return res.status(403).json({ error: "Access denied: Incorrect role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
