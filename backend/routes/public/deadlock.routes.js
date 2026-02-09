const express = require("express");
const router = express.Router();
const controller = require("../../controller/public/deadlock.public.controller");

router.post("/submit", controller.submitAnswer);
router.get("/match/:id", controller.getMatchState);

module.exports = router;
