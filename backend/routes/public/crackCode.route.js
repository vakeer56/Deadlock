const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const CrackCodeSession = require("../../model/CrackCodeSession");
const CrackCodeSubmission = require("../../model/CrackCodeSubmission");
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
      return res.status(400).json({ message: "Valid teamId is required" });
    }

    const team = await Team.findById(teamId).select("deadlockResult");
    if (!team || !['win', 'winner'].includes(team.deadlockResult)) {
      return res.status(403).json({
        message: "ACCESS DENIED: Team has not completed previous mission directives.",
      });
    }

    const session = await CrackCodeSession.findOne({ teamId });
    if (!session) {
      return res.status(404).json({ message: "Crack Code session not started" });
    }

    // Check for existing submission
    const submission = await CrackCodeSubmission.findOne({ teamId, crackCodeSessionId: session._id });

    return res.json({
      sessionId: session._id,
      attemptsUsed: session.attemptsUsed,
      maxAttempts: session.maxAttempts,
      startedAt: session.startedAt,
      endedAt: session.endedAt || null,
      submission: submission ? {
        isFirst: submission.finalWinner,
        message: submission.finalWinner
          ? "YOU WON\nYOU SUCCESSFULLY CRACKED THE CODE BY REVERSE ENGINEERING"
          : submission.isCorrect
            ? "YOUR EFFORTS NEED TO BE APPRECIATED\nBUT SMALL TIME MANAGEMENT LACKING DECIDED SOMEOTHER AS WINNER. YOU CRACKED THE CODE..."
            : "THANK YOU FOR PARTICIPATION\nTHE GAME HAS ENDED"
      } : null
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

router.post("/submit", async (req, res) => {
  try {
    const { teamId, sessionId, submittedLogic, isCorrect: providedIsCorrect } = req.body;

    if (!teamId || !sessionId || !submittedLogic) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Default to true if not provided (to maintain backward compatibility for manual submits)
    const isCorrect = providedIsCorrect !== undefined ? providedIsCorrect : true;

    // 1. Check if CURRENT team already submitted
    const existing = await CrackCodeSubmission.findOne({ teamId, crackCodeSessionId: sessionId });
    if (existing) {
      return res.json({
        success: true,
        isFirst: existing.finalWinner,
        message: existing.finalWinner
          ? "YOU WON\nYOU SUCCESSFULLY CRACKED THE CODE BY REVERSE ENGINEERING"
          : existing.isCorrect
            ? "YOUR EFFORTS NEED TO BE APPRECIATED\nBUT SMALL TIME MANAGEMENT LACKING DECIDED SOMEOTHER AS WINNER. YOU CRACKED THE CODE..."
            : "THANK YOU FOR PARTICIPATION\nTHE GAME HAS ENDED"
      });
    }

    // 2. Check if ANY team already won
    const globalWinner = await CrackCodeSubmission.findOne({ finalWinner: true });
    // A team can only be a finalWinner if they are correct AND no one else has won yet
    const isFirst = isCorrect && !globalWinner;

    // 3. Create record
    const submission = new CrackCodeSubmission({
      teamId,
      crackCodeSessionId: sessionId,
      submittedLogic,
      isCorrect,
      finalWinner: isFirst,
      submittedAt: new Date()
    });

    await submission.save();
    await CrackCodeSession.findByIdAndUpdate(sessionId, { endedAt: new Date() });

    return res.json({
      success: true,
      isFirst,
      message: isFirst
        ? "YOU WON\nYOU SUCCESSFULLY CRACKED THE CODE BY REVERSE ENGINEERING"
        : isCorrect
          ? "YOUR EFFORTS NEED TO BE APPRECIATED\nBUT SMALL TIME MANAGEMENT LACKING DECIDED SOMEOTHER AS WINNER. YOU CRACKED THE CODE..."
          : "THANK YOU FOR PARTICIPATION\nTHE GAME HAS ENDED"
    });
  } catch (error) {
    console.error("Submission error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
