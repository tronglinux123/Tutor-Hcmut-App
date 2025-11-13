const express = require("express");
const router = express.Router();
const mentorController = require("./mentor.controller");

router.post("/apply", mentorController.applicate);
router.post("/check", mentorController.check);
router.get("/list", mentorController.getAllApplications); // ✅ thêm dòng này
router.post("/reject", mentorController.delete);
router.post("/approve", mentorController.access);
router.post("/pending", mentorController.pending);
router.post("/pending/bulk", mentorController.pendingBulk);

module.exports = router;
