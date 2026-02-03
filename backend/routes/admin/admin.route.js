import express from "express";
const router = express.Router();

import {
    createMatch,
    resetMatch,
    updateTeams,
    swapTeams,
    finishMatch
} from "../../controller/admin.controller.js";


router.post("/match", createMatch);


router.patch("/match/:id/teams", updateTeams);


router.patch("/match/:id/swap", swapTeams);


router.patch("/match/:id/reset", resetMatch);


router.patch("/match/:id/finish", finishMatch);

export default router;
