import express from "express";
import {
  createTrek,
  deleteTrek,
  getAssignedTreks,
  getTrekById,
  getTreks,
  updateAssignedTrekStatus,
  updateTrek,
} from "../controllers/trekController.js";
import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// All authenticated users
router.get("/", getTreks);

// Staff routes
router.get(
  "/assigned/me",
  authorizeRoles("staff"),
  getAssignedTreks
);

router.patch(
  "/assigned/:id/status",
  authorizeRoles("staff"),
  updateAssignedTrekStatus
);

// Admin creates a trek
router.post(
  "/",
  authorizeRoles("admin"),
  createTrek
);

// Dynamic ID routes neeche rahenge
router.get("/:id", getTrekById);

router.patch(
  "/:id",
  authorizeRoles("admin"),
  updateTrek
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteTrek
);

export default router;