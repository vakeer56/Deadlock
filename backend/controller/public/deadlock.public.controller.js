const DeadlockMatch = require("../../model/deadlock.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");
const DeadlockSubmission = require("../../model/deadlockSubmission.model");

/*
----------------------------------------------------
PLAYER SUBMIT ANSWER
POST /api/public/deadlock/submit
----------------------------------------------------
*/
exports.submitAnswer = async (req, res) => {
    try {
        const { matchId, teamId, questionId, answer } = req.body;

        if (!matchId || !teamId || !questionId || !answer) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const match = await DeadlockMatch.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        if (match.status !== "ongoing") {
            return res.status(400).json({ message: "Match is not ongoing" });
        }

        // Validate team belongs to match
        const isTeamA = match.teamA.toString() === teamId;
        const isTeamB = match.teamB.toString() === teamId;

        if (!isTeamA && !isTeamB) {
            return res.status(403).json({ message: "Team not part of this match" });
        }

        const question = await DeadlockQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const isCorrect =
            answer.trim().toLowerCase() ===
            question.answer.trim().toLowerCase();

        // Save submission with correct schema keys
        await DeadlockSubmission.create({
            matchId: matchId,
            teamId: teamId,
            questionId: questionId,
            answer,
            isCorrect
        });

        // If correct → move tug
        if (isCorrect) {
            match.tugPosition += isTeamA ? 1 : -1;

            // Check win condition
            if (match.tugPosition >= match.maxPull) {
                match.winner = match.teamA;
                match.loser = match.teamB;
                match.status = "finished";
            } else if (match.tugPosition <= -match.maxPull) {
                match.winner = match.teamB;
                match.loser = match.teamA;
                match.status = "finished";
            }

            await match.save();
        }

        res.json({
            correct: isCorrect,
            tugPosition: match.tugPosition,
            winner: match.winner || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/*
----------------------------------------------------
GET MATCH STATE
GET /api/public/deadlock/match/:id
----------------------------------------------------
*/
exports.getMatchState = async (req, res) => {
    try {
        const match = await DeadlockMatch.findById(req.params.id)
            .populate("teamA teamB winner");

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json({
            teamA: match.teamA,
            teamB: match.teamB,
            tugPosition: match.tugPosition,
            status: match.status,
            winner: match.winner
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

