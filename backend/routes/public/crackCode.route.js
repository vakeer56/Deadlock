const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const CrackCodeSession = require("../../model/CrackCodeSession");
const Team = require("../../model/team.model");

/*
  GET /crack-code/session/:teamId

  - Allow a team to fetch its CrackCodeSession state
  - Used when player opens the game screen
*/
router.get("/session/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        message: "Valid teamId is required",
      });
    }

    // Verify team eligibility
    const team = await Team.findById(teamId).select("deadlockResult");
    if (!team || !['win', 'winner'].includes(team.deadlockResult)) {
      return res.status(403).json({
        message: "ACCESS DENIED: Team has not completed previous mission directives.",
      });
    }

    // Find the session for this team
    const session = await CrackCodeSession.findOne({ teamId });

    // If session does not exist
    if (!session) {
      return res.status(404).json({
        message: "Crack Code session not started for this team",
      });
    }

    // 4. Send safe session data
    return res.json({
      sessionId: session._id,
      attemptsUsed: session.attemptsUsed,
      maxAttempts: session.maxAttempts,
      startedAt: session.startedAt,
      endedAt: session.endedAt || null,
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return res.status(500).json({
      message: "Internal server error while fetching session",
    });
  }
});

router.get("/eligible-teams", async (req, res) => {
  try {
    const count = await Team.countDocuments({
      deadlockResult: { $in: ['win', 'winner'] }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting teams" });
  }
});

router.get("/global-status", async (req, res) => {
  try {
    const sessionExists = await CrackCodeSession.findOne();
    res.json({ started: !!sessionExists });
  } catch (error) {
    res.status(500).json({ message: "Error fetching global status" });
  }
});

router.get("/team-status/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid Team ID" });
    }
    const team = await Team.findById(teamId).select("currentRound deadlockResult");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team status" });
  }
});

module.exports = router;
