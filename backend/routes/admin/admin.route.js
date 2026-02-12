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
    getMatches,
    terminateSession,
    startAllDeadlockMatches,
    checkTeam
} = require("../../controller/admin.controller.js");

const { solveProblem } = require("../../controller/deadlock.controller.js");


router.post("/match", createMatch);
router.post("/solve", solveProblem);
router.post("/deadlock/start-all", startAllDeadlockMatches);
router.post("/terminate", terminateSession);
router.post("/team", createTeam);
router.post("/team/check", checkTeam);

router.get("/team/check/:name", checkTeam);

router.patch("/match/:id/update-teams", updateTeams);
router.patch("/match/:id/swap", swapTeams);
router.patch("/match/:id/reset", resetMatch);
// New route: Finish by Team ID (no match ID required)
router.patch("/finish", finishMatch);
router.patch("/match/:id/finish", finishMatch);

router.get("/teams", getTeam);
router.get("/matches", getMatches);
router.delete("/matches", terminateSession); // Map delete to terminate as well for backward compatibility

module.exports = router;
