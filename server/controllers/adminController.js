import User from "../models/User.js";
import Trek from "../models/Trek.js";
import Booking from "../models/Booking.js";

const accountFields =
  "name email role isApproved approvalStatus isBlacklisted profileImage createdAt";

// GET /api/admin/staff?status=pending
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
      .select(accountFields)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    console.error("Unable to fetch staff:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch staff accounts",
    });
  }
};

// PATCH /api/admin/staff/:id/approve
export const approveStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "staff",
      },
      {
        $set: {
          isApproved: true,
          approvalStatus: "approved",
          isBlacklisted: false,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(accountFields);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff account approved successfully",
      staff,
    });
  } catch (error) {
    console.error("Unable to approve staff:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve staff account",
    });
  }
};

// PATCH /api/admin/staff/:id/reject
export const rejectStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "staff",
      },
      {
        $set: {
          isApproved: false,
          approvalStatus: "rejected",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(accountFields);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff account rejected successfully",
      staff,
    });
  } catch (error) {
    console.error("Unable to reject staff:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject staff account",
    });
  }
};

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const pendingStaffFilter = {
      role: "staff",
      isApproved: false,
      $or: [
        { approvalStatus: "pending" },
        { approvalStatus: "not_required" },
        { approvalStatus: { $exists: false } },
      ],
    };

    const [
      totalTreks,
      totalUsers,
      pendingStaff,
      totalBookings,
    ] = await Promise.all([
      Trek.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments(pendingStaffFilter),
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
    console.error("Unable to fetch dashboard stats:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
    });
  }
};

// GET /api/admin/accounts?role=user
// GET /api/admin/accounts?role=staff
export const getAccounts = async (req, res) => {
  try {
    const { role } = req.query;

    if (!["user", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be user or staff",
      });
    }

    const accounts = await User.find({ role })
      .select(accountFields)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error("Unable to fetch accounts:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch accounts",
    });
  }
};

// PATCH /api/admin/accounts/:id/blacklist
export const updateBlacklistStatus = async (req, res) => {
  try {
    const { isBlacklisted } = req.body;

    if (typeof isBlacklisted !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBlacklisted must be true or false",
      });
    }

    const account = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: {
          $in: ["user", "staff"],
        },
      },
      {
        $set: {
          isBlacklisted,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(accountFields);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isBlacklisted
        ? "Account added to blacklist"
        : "Account removed from blacklist",
      account,
    });
  } catch (error) {
    console.error("Unable to update blacklist status:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update blacklist status",
    });
  }
};