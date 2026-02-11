const express = require("express");
const router = express.Router();

const Team = require("../../model/team.model");
const CrackCodeSession = require("../../model/CrackCodeSession");
const CrackCodeSubmission = require("../../model/CrackCodeSubmission");
const CrackCodeAttempt = require("../../model/CrackCodeAttempt");

/*
  POST /admin/crack-code/start
  
  - Admin starts the Crack the Code game
  - Creates one CrackCodeSession per active team
*/
router.post("/start", async (req, res) => {
  try {
    // Fetch ONLY teams that won their Deadlock matches
    const teams = await Team.find({ deadlockResult: 'win' });

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
  GET /admin/crack-code/winner-info
  - Fetches the team details of the first winner
*/
router.get("/winner-info", async (req, res) => {
  try {
    // 1. Fetch the absolute winner (first one)
    const winnerSubmission = await CrackCodeSubmission.findOne({ finalWinner: true })
      .populate("teamId", "name members");

    // 2. Fetch ALL successful breaches, sorted by time
    const allSuccessful = await CrackCodeSubmission.find({ isCorrect: true })
      .sort({ submittedAt: 1 })
      .populate("teamId", "name members");

    return res.json({
      winnerFound: !!winnerSubmission,
      winner: winnerSubmission ? {
        teamName: winnerSubmission.teamId.name,
        members: winnerSubmission.teamId.members,
        submittedAt: winnerSubmission.submittedAt
      } : null,
      allBreaches: allSuccessful.map(sub => ({
        id: sub._id,
        teamId: sub.teamId._id,
        teamName: sub.teamId.name,
        members: sub.teamId.members,
        submittedAt: sub.submittedAt,
        isAbsoluteWinner: sub.finalWinner
      }))
    });
  } catch (error) {
    console.error("Winner info error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/*
  DELETE /admin/crack-code/reset
  
  - Admin clears all active Crack the Code sessions and data
*/
router.delete("/reset", async (req, res) => {
  try {
    await CrackCodeSession.deleteMany({});
    await CrackCodeSubmission.deleteMany({});
    await CrackCodeAttempt.deleteMany({});

    return res.json({
      message: "All Crack the Code sessions, submissions, and attempts have been purged. Systems reset.",
    });
  } catch (error) {
    console.error("CrackCode RESET error:", error);
    return res.status(500).json({
      message: "Internal server error while resetting sessions",
    });
  }
});

module.exports = router;
