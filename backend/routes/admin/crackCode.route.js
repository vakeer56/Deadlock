const express = require("express");
const router = express.Router();

const Team = require("../../model/team.model");
const CrackCodeSession = require("../../model/CrackCodeSession");

/*
  POST /admin/crack-code/start
  
  - Admin starts the Crack the Code game
  - Creates one CrackCodeSession per active team
*/
router.post("/start", async (req, res) => {
  try {

    // Fetch all active teams
    const teams = await Team.find({ currentRound: 'crack-the-code' });

    if (teams.length === 0) {
      return res.status(400).json({
        message: "No active teams found",
      });
    }
    const alreadyStarted = await CrackCodeSession.findOne();
    if (alreadyStarted) {
        return res.status(400).json({
            message: "Crack the Code game already started",
        });
    }
    // Create CrackCodeSession for each team
    for (const team of teams) {

      await CrackCodeSession.create({
        teamId: team._id,
        attemptsUsed: 0,
        maxAttempts: 50,
        startedAt: new Date(),
      });
    }

    return res.json({
      message: "Crack the Code game started successfully",
    });
  } catch (error) {
    console.error("CrackCode START error:", error);
    return res.status(500).json({
      message: "Internal server error while starting Crack the Code",
      error: error.message,
    });
  }
});

module.exports = router;
