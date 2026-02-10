const express = require('express');
const router = express.Router();

const {
    createMatch,
    createTeam,
    resetMatch,
    updateTeams,
    swapTeams,
    finishMatch,
    getTeam,
    startAllDeadlockMatches,
    checkTeam
} = require("../../controller/admin.controller.js");

const { solveProblem } = require("../../controller/deadlock.controller.js");


router.post("/match", createMatch);
router.post("/solve", solveProblem);
router.post("/deadlock/start-all", startAllDeadlockMatches);
router.post("/team", createTeam);
router.post("/team/check", checkTeam);

router.get("/team/check/:name", checkTeam);

router.patch("/match/:id/teams", updateTeams);
router.patch("/match/:id/swap", swapTeams);
router.patch("/match/:id/reset", resetMatch);
router.patch("/match/:id/finish", finishMatch);

router.get("/teams", getTeam);

module.exports = router;
