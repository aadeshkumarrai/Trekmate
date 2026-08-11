import express from "express";
import {
  approveStaff,
  getAccounts,
  getDashboardStats,
  getStaff,
  rejectStaff,
  updateBlacklistStatus,
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

router.get("/accounts", getAccounts);
router.patch(
  "/accounts/:id/blacklist",
  updateBlacklistStatus
);

export default router;