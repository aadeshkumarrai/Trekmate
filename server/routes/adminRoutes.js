import express from "express";
import {
  getStaff,
  approveStaff,
  rejectStaff,
  getDashboardStats,
} from "../controllers/adminController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/stats", getDashboardStats);

router.get("/staff", getStaff);
router.patch("/staff/:id/approve", approveStaff);
router.patch("/staff/:id/reject", rejectStaff);

export default router;