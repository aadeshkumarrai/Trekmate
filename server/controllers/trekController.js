import Trek from "../models/Trek.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

export const createTrek = async (req, res) => {
  try {
    const {
      name,
      location,
      difficulty,
      durationDays,
      price,
      totalSlots,
      startDate,
      endDate,
      assignedStaff,
      status,
      description,
      image,
    } = req.body;

    if (
      !name ||
      !location ||
      !difficulty ||
      !durationDays ||
      price === undefined ||
      !totalSlots ||
      !startDate ||
      !endDate ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required trek details",
      });
    }

    let approvedStaff = null;

    if (assignedStaff) {
      approvedStaff = await User.findOne({
        _id: assignedStaff,
        role: "staff",
        isApproved: true,
      });

      if (!approvedStaff) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned staff account is not approved",
        });
      }
    }

    const trek = await Trek.create({
      name,
      location,
      difficulty,
      durationDays,
      price,
      totalSlots,
      availableSlots: totalSlots,
      startDate,
      endDate,
      assignedStaff: approvedStaff?._id || null,
      status: status || "open",
      description,
      image: image || "",
      createdBy: req.user._id,
    });

    await trek.populate(
      "assignedStaff",
      "name email profileImage"
    );

    return res.status(201).json({
      success: true,
      message: "Trek created successfully",
      trek,
    });
  } catch (error) {
    console.error(
      `Create trek failed: ${error.message}`
    );

    if (error.name === "ValidationError") {
      const firstError = Object.values(
        error.errors
      )[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create trek",
    });
  }
};

export const getTreks = async (req, res) => {
  try {
    const {
      difficulty,
      location,
      status,
      search,
    } = req.query;

    const filter = {};

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.location = {
        $regex: escapeRegex(location),
        $options: "i",
      };
    }

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          location: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const treks = await Trek.find(filter)
      .populate(
        "assignedStaff",
        "name email profileImage"
      )
      .sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: treks.length,
      treks,
    });
  } catch (error) {
    console.error(
      `Fetch treks failed: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch treks",
    });
  }
};

export const getTrekById = async (req, res) => {
  try {
    const trek = await Trek.findById(req.params.id)
      .populate(
        "assignedStaff",
        "name email profileImage"
      )
      .populate("createdBy", "name email");

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    return res.status(200).json({
      success: true,
      trek,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trek",
    });
  }
};

export const updateTrek = async (req, res) => {
  try {
    const trek = await Trek.findById(
      req.params.id
    );

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    const editableFields = [
      "name",
      "location",
      "difficulty",
      "durationDays",
      "price",
      "startDate",
      "endDate",
      "status",
      "description",
      "image",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trek[field] = req.body[field];
      }
    });

    if (req.body.totalSlots !== undefined) {
      const newTotalSlots = Number(
        req.body.totalSlots
      );

      const bookedSlots =
        trek.totalSlots - trek.availableSlots;

      if (newTotalSlots < bookedSlots) {
        return res.status(400).json({
          success: false,
          message:
            "Total slots cannot be lower than existing bookings",
        });
      }

      trek.totalSlots = newTotalSlots;
      trek.availableSlots =
        newTotalSlots - bookedSlots;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "assignedStaff"
      )
    ) {
      if (!req.body.assignedStaff) {
        trek.assignedStaff = null;
      } else {
        const staff = await User.findOne({
          _id: req.body.assignedStaff,
          role: "staff",
          isApproved: true,
        });

        if (!staff) {
          return res.status(400).json({
            success: false,
            message:
              "Assigned staff account is not approved",
          });
        }

        trek.assignedStaff = staff._id;
      }
    }

    await trek.save();

    await trek.populate(
      "assignedStaff",
      "name email profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Trek updated successfully",
      trek,
    });
  } catch (error) {
    console.error(
      `Update trek failed: ${error.message}`
    );

    if (error.name === "ValidationError") {
      const firstError = Object.values(
        error.errors
      )[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update trek",
    });
  }
};

export const deleteTrek = async (req, res) => {
  try {
    const trek = await Trek.findById(
      req.params.id
    );

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    const bookingExists =
      await Booking.exists({
        trek: trek._id,
      });

    if (bookingExists) {
      return res.status(400).json({
        success: false,
        message:
          "A trek with booking history cannot be deleted",
      });
    }

    await trek.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Trek deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete trek",
    });
  }
};

export const getAssignedTreks = async (
  req,
  res
) => {
  try {
    const treks = await Trek.find({
      assignedStaff: req.user._id,
    }).sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: treks.length,
      treks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch assigned treks",
    });
  }
};

export const updateAssignedTrekStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (
      !["in_progress", "completed"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be in_progress or completed",
      });
    }

    const trek = await Trek.findOne({
      _id: req.params.id,
      assignedStaff: req.user._id,
    });

    if (!trek) {
      return res.status(404).json({
        success: false,
        message:
          "Assigned trek not found for this staff account",
      });
    }

    if (
      status === "in_progress" &&
      trek.status !== "open"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only an open trek can be started",
      });
    }

    if (
      status === "completed" &&
      trek.status !== "in_progress"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start the trek before completing it",
      });
    }

    trek.status = status;
    await trek.save();

    if (status === "completed") {
      await Booking.updateMany(
        {
          trek: trek._id,
          status: "booked",
        },
        {
          $set: {
            status: "completed",
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        status === "in_progress"
          ? "Trek started successfully"
          : "Trek completed successfully",
      trek,
    });
  } catch (error) {
    console.error(
      `Staff trek status update failed: ${error.message}`
    );

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update trek status",
    });
  }
};