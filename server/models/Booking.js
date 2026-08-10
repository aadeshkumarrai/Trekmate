import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    trek: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trek",
      required: true,
      index: true,
    },

    participants: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  {
    user: 1,
    trek: 1,
  },
  {
    unique: true,
  }
);

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;