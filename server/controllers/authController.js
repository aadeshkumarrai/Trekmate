import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "3h",
    }
  );
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
});

const sendTokenResponse = (
  user,
  statusCode,
  message,
  res
) => {
  const token = createToken(user._id);

  return res
    .status(statusCode)
    .cookie("token", token, {
      ...getCookieOptions(),
      maxAge: 3 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        isBlacklisted: user.isBlacklisted,
        profileImage: user.profileImage,
      },
    });
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "user",
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const allowedRoles = ["user", "staff"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      isApproved: role === "user",
      approvalStatus:
        role === "staff"
          ? "pending"
          : "not_required",
      isBlacklisted: false,
      isEmailVerified: true,
    });

    if (role === "staff") {
      return res.status(201).json({
        success: true,
        message:
          "Staff registration submitted. Wait for admin approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          approvalStatus: user.approvalStatus,
          isBlacklisted: user.isBlacklisted,
        },
      });
    }

    return sendTokenResponse(
      user,
      201,
      "Account created successfully",
      res
    );
  } catch (error) {
    console.error("Registration failed:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (
      !user ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blacklisted. Contact the administrator.",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is waiting for admin approval",
      });
    }

    return sendTokenResponse(
      user,
      200,
      "Login successful",
      res
    );
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

export const logout = (req, res) => {
  return res
    .status(200)
    .clearCookie(
      "token",
      getCookieOptions()
    )
    .json({
      success: true,
      message: "Logout successful",
    });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isApproved: req.user.isApproved,
      approvalStatus: req.user.approvalStatus,
      isBlacklisted: req.user.isBlacklisted,
      profileImage: req.user.profileImage,
    },
  });
};