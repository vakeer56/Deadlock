const express = require('express');
const router = express.Router();

const {
    createMatch,
    createTeam,
    resetMatch,
    updateTeams,
    swapTeams,
    finishMatch,
    getTeam  
} = require("../../controller/admin.controller.js");


router.post("/match", createMatch);
router.patch("/match/:id/teams", updateTeams);
router.patch("/match/:id/swap", swapTeams);
router.patch("/match/:id/reset", resetMatch);
router.patch("/match/:id/finish", finishMatch);

router.get("/teams", getTeam);

router.post("/team", createTeam);

module.exports = router;
