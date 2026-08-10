import mongoose from "mongoose";

const trekSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Trek name is required"],
      trim: true,
      maxlength: 100,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 120,
    },

    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      required: [true, "Difficulty is required"],
    },

    durationDays: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
      max: 60,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    totalSlots: {
      type: Number,
      required: [true, "Total slots are required"],
      min: 1,
    },

    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be after the start date",
      },
    },

    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "open",
        "closed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "open",
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 2000,
    },

    image: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

trekSchema.index({ status: 1, startDate: 1 });
trekSchema.index({ location: 1, difficulty: 1 });

const Trek = mongoose.model("Trek", trekSchema);

export default Trek;