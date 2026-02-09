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

    // Fetch ONLY teams that won their Deadlock matches
    const teams = await Team.find({ deadlockResult: { $in: ['win', 'winner'] } });

    if (teams.length === 0) {
      return res.status(400).json({
        message: "STALEMATE DETECTED: No winning teams eligible for decryption.",
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

/*
  DELETE /admin/crack-code/reset
  
  - Admin clears all active Crack the Code sessions
*/
router.delete("/reset", async (req, res) => {
  try {
    await CrackCodeSession.deleteMany({});
    return res.json({
      message: "All Crack the Code sessions have been purged. Systems reset.",
    });
  } catch (error) {
    console.error("CrackCode RESET error:", error);
    return res.status(500).json({
      message: "Internal server error while resetting sessions",
    });
  }
});

module.exports = router;
