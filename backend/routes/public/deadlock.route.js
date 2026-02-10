const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DeadlockMatch = require("../../model/deadlock.model");

// GET /api/public/deadlock/match/:teamId
router.get("/match/:teamId", async (req, res) => {
    try {
        const { teamId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const match = await DeadlockMatch.findOne({
            $or: [{ teamA: teamId }, { teamB: teamId }],
            status: { $in: ["lobby", "ongoing"] }
        }).populate("teamA teamB", "name");

        if (!match) {
            return res.status(404).json({ message: "No active match found." });
        }

        const isTeamA = match.teamA._id.toString() === teamId;
        const opponent = isTeamA ? match.teamB : match.teamA;

        res.json({
            matchId: match._id,
            status: match.status,
            opponentName: opponent ? opponent.name : "PENDING...",
            tugPosition: match.tugPosition,
            maxPull: match.maxPull
        });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
});

module.exports = router;
