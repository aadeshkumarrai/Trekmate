import express from "express";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getAssignedParticipants,
  getMyBookings,
} from "../controllers/bookingController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/treks/:trekId",
  authorizeRoles("user"),
  createBooking
);

router.get(
  "/me",
  authorizeRoles("user"),
  getMyBookings
);

router.patch(
  "/:id/cancel",
  authorizeRoles("user"),
  cancelBooking
);

router.get(
  "/admin/all",
  authorizeRoles("admin"),
  getAllBookings
);

router.get(
  "/staff/participants",
  authorizeRoles("staff"),
  getAssignedParticipants
);

export default router;