const express = require("express");
const router = express.Router();

const Team = require("../../models/Team");
const CrackCodeSession = require("../../models/CrackCodeSession");

/*
  POST /admin/crack-code/start
  
  - Admin starts the Crack the Code game
  - Creates one CrackCodeSession per active team
*/
router.post("/start", async (req, res) => {
  try {
    const { gameSessionId } = req.body;

    if (!gameSessionId) {
      return res.status(400).json({
        message: "gameSessionId is required to start the game",
      });
    }

    // Fetch all active teams
    const teams = await Team.find({ isActive: true });

    if (teams.length === 0) {
      return res.status(400).json({
        message: "No active teams found",
      });
    }

    // Create CrackCodeSession for each team
    for (const team of teams) {
      // Prevent duplicate session creation
      const existingSession = await CrackCodeSession.findOne({
        teamId: team._id,
        gameSessionId,
      });

      if (existingSession) continue;

      await CrackCodeSession.create({
        teamId: team._id,
        gameSessionId,
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
    });
  }
});

module.exports = router;
