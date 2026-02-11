const express = require("express");
const router = express.Router();
const controller = require("../../controller/public/deadlock.public.controller");

router.post("/submit", controller.submitDeadlock);
router.get("/match/team/:teamId", controller.getMatchByTeam);
router.get("/match/:id", controller.getMatchState);

module.exports = router;
