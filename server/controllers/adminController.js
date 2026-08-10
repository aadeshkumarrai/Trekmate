import User from "../models/User.js";
import Trek from "../models/Trek.js";
import Booking from "../models/Booking.js";

export const getStaff = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const filter = {
      role: "staff",
    };

    if (status === "pending") {
      filter.isApproved = false;
      filter.$or = [
        { approvalStatus: "pending" },
        { approvalStatus: "not_required" },
        { approvalStatus: { $exists: false } },
      ];
    } else if (status === "approved") {
      filter.isApproved = true;
      filter.approvalStatus = "approved";
    } else if (status === "rejected") {
      filter.isApproved = false;
      filter.approvalStatus = "rejected";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid staff status",
      });
    }

    const staff = await User.find(filter)
      .select(
        "name email role isApproved approvalStatus profileImage createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error(`Fetch staff failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch staff accounts",
    });
  }
};

export const approveStaff = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    staff.isApproved = true;
    staff.approvalStatus = "approved";
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff account approved successfully",
      staff,
    });
  } catch (error) {
    console.error(`Approve staff failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Unable to approve staff account",
    });
  }
};

export const rejectStaff = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    staff.isApproved = false;
    staff.approvalStatus = "rejected";
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff account rejected",
      staff,
    });
  } catch (error) {
    console.error(`Reject staff failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Unable to reject staff account",
    });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalTreks,
      totalUsers,
      pendingStaff,
      totalBookings,
    ] = await Promise.all([
      Trek.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({
        role: "staff",
        approvalStatus: "pending",
      }),
      Booking.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalTreks,
        totalUsers,
        pendingStaff,
        totalBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics",
    });
  }
};