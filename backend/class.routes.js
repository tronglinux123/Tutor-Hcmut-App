const express = require("express");
const router = express.Router();
const classController = require("./class.controller");

router.get("/classes", classController.getClasses);

module.exports = router;

