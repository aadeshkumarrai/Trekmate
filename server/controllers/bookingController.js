import Booking from "../models/Booking.js";
import Trek from "../models/Trek.js";

export const createBooking = async (req, res) => {
  const participants = Number(req.body.participants || 1);

  if (
    !Number.isInteger(participants) ||
    participants < 1 ||
    participants > 10
  ) {
    return res.status(400).json({
      success: false,
      message: "Participants must be between 1 and 10",
    });
  }

  let reservedTrek = null;

  try {
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      trek: req.params.trekId,
    });

    if (
      existingBooking &&
      existingBooking.status !== "cancelled"
    ) {
      return res.status(409).json({
        success: false,
        message: "You have already booked this trek",
      });
    }

    reservedTrek = await Trek.findOneAndUpdate(
      {
        _id: req.params.trekId,
        status: "open",
        availableSlots: {
          $gte: participants,
        },
      },
      {
        $inc: {
          availableSlots: -participants,
        },
      },
      {
        new: true,
      }
    );

    if (!reservedTrek) {
      return res.status(400).json({
        success: false,
        message:
          "Trek is unavailable or does not have enough slots",
      });
    }

    let booking;

    if (existingBooking) {
      existingBooking.participants = participants;
      existingBooking.totalAmount =
        reservedTrek.price * participants;
      existingBooking.status = "booked";
      existingBooking.bookingDate = new Date();

      booking = await existingBooking.save();
    } else {
      booking = await Booking.create({
        user: req.user._id,
        trek: reservedTrek._id,
        participants,
        totalAmount:
          reservedTrek.price * participants,
      });
    }

    await booking.populate(
      "trek",
      "name location startDate endDate price status"
    );

    return res.status(201).json({
      success: true,
      message: "Trek booked successfully",
      booking,
    });
  } catch (error) {
    console.error(`Create booking failed: ${error.message}`);

    if (reservedTrek) {
      await Trek.findByIdAndUpdate(reservedTrek._id, {
        $inc: {
          availableSlots: participants,
        },
      });
    }

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already booked this trek",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create booking",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate({
        path: "trek",
        select:
          "name location difficulty durationDays price startDate endDate status image assignedStaff",
        populate: {
          path: "assignedStaff",
          select: "name email",
        },
      })
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your bookings",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: "booked",
      },
      {
        $set: {
          status: "cancelled",
        },
      },
      {
        new: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Active booking not found",
      });
    }

    await Trek.findByIdAndUpdate(booking.trek, {
      $inc: {
        availableSlots: booking.participants,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to cancel booking",
    });
  }
};
export const getAllBookings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email profileImage")
      .populate(
        "trek",
        "name location startDate endDate assignedStaff"
      )
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings",
    });
  }
};

export const getAssignedParticipants = async (
  req,
  res
) => {
  try {
    const assignedTreks = await Trek.find({
      assignedStaff: req.user._id,
    }).select("_id");

    const trekIds = assignedTreks.map(
      (trek) => trek._id
    );

    const bookings = await Booking.find({
      trek: {
        $in: trekIds,
      },
      status: "booked",
    })
      .populate("user", "name email profileImage")
      .populate(
        "trek",
        "name location startDate endDate status"
      )
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch trek participants",
    });
  }
};