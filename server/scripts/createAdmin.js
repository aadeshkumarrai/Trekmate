import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required"
      );
    }

    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.toLowerCase().trim();

    let admin = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD;
      admin.role = "admin";
      admin.isApproved = true;
      admin.approvalStatus = "not_required";

      await admin.save();

      console.log("Existing account updated as admin");
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: normalizedEmail,
        password: ADMIN_PASSWORD,
        role: "admin",
        isApproved: true,
        approvalStatus: "not_required",
      });

      console.log("Admin account created successfully");
    }
  } catch (error) {
    console.error(`Admin creation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();