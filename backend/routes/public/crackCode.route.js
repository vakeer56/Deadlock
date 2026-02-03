const express = require("express");
const router = express.Router();

const CrackCodeSession = require("../../models/CrackCodeSession");

/*
  GET /crack-code/session/:teamId

  - Allow a team to fetch its CrackCodeSession state
  - Used when player opens the game screen
*/
router.get("/session/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        message: "teamId is required",
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

module.exports = router;
