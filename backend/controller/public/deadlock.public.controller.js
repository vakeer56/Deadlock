const DeadlockMatch = require("../../model/deadlock.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");
const DeadlockSubmission = require("../../model/deadlockSubmission.model");
const Team = require("../../model/team.model");
const { runCode } = require("../../utils/piston");

/*
----------------------------------------------------
PLAYER SUBMIT ANSWER
POST /api/public/deadlock/submit
----------------------------------------------------
*/
exports.submitDeadlock = async (req, res) => {
    try {
        const { matchId, teamId, questionId, language, code } = req.body;

        // Validate match
        const match = await DeadlockMatch.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        if (match.status !== "ongoing") {
            return res.status(400).json({ message: "Match is not ongoing" });
        }

        // Validate team
        const isTeamA = match.teamA.toString() === teamId;
        const isTeamB = match.teamB.toString() === teamId;

        if (!isTeamA && !isTeamB) {
            return res.status(403).json({ message: "Team not in this match" });
        }

        // Get CURRENT question from match (AUTHORITATIVE)
        const currentQuestionId =
            match.questions[match.currentQuestionIndex];

        // NEW: Validate correct question submit
        if (currentQuestionId.toString() !== questionId) {
            return res.status(409).json({ // 409 Conflict
                message: "Question mismatch or already solved. Please refresh.",
                currentQuestionId: currentQuestionId,
                yourQuestionId: questionId
            });
        }

        const question = await DeadlockQuestion.findById(currentQuestionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        let verdict = "AC";
        let error = null;

        // Run code against all test cases
        for (const testCase of question.testCases) {
            const result = await runCode({
                language,
                code,
                input: testCase.input
            });

            if (result.run.stderr) {
                verdict = "RUNTIME_ERROR";
                error = result.run.stderr.trim();
                break;
            }

            const output = result.run.stdout.trim();
            const expected = testCase.output.trim();

            if (output !== expected) {
                verdict = "WRONG_ANSWER";
                break;
            }
        }

        // Save submission
        await DeadlockSubmission.create({
            matchId: matchId,
            teamId: teamId,
            questionId: currentQuestionId,
            language,
            verdict,
            answer: code,
            isCorrect: verdict === "AC"
        });

        // If failed -> stop here
        if (verdict !== "AC") {
            return res.json({
                success: false,
                verdict,
                error
            });
        }

        //Move tug
        if (isTeamA) {
            match.tugPosition += 1;
            match.scoreA += 1;
        } else {
            match.tugPosition -= 1;
            match.scoreB += 1;
        }

        // Advance question (Looping)
        match.currentQuestionIndex = (match.currentQuestionIndex + 1) % match.questions.length;

        // Win condition
        if (Math.abs(match.tugPosition) >= match.maxPull) {
            match.status = "finished";
            match.winner = teamId;
            match.loser = isTeamA ? match.teamB : match.teamA;

            // Update winner team record
            await Team.findByIdAndUpdate(match.winner, {
                currentRound: "crack-the-code",
                deadlockResult: "win"
            });

            // Update loser team record
            await Team.findByIdAndUpdate(match.loser, {
                currentRound: "eliminated",
                deadlockResult: "lose"
            });
        }

        await match.save();

        res.json({
            success: true,
            verdict: "AC",
            tugPosition: match.tugPosition,
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            status: match.status,
            nextQuestionIndex: match.currentQuestionIndex
        });
    } catch (err) {
        console.error("Deadlock submit error:", err);
        res.status(500).json({ message: "Submission failed", error: err.message });
    }
};

//get match state
exports.getMatchState = async (req, res) => {
    try {
        const match = await DeadlockMatch.findById(req.params.id)
            .populate("teamA teamB winner")
            .populate("questions");

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        console.log("DEBUG: Match questions found:", match.questions ? match.questions.length : "NULL");
        console.log("DEBUG: Match currentQuestionIndex:", match.currentQuestionIndex);

        const currentQuestion =
            match.questions[match.currentQuestionIndex];

        console.log("DEBUG: Found currentQuestion:", currentQuestion ? currentQuestion.title : "UNDEFINED");

        res.json({
            teamA: match.teamA,
            teamB: match.teamB,
            tugPosition: match.tugPosition,
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            maxPull: match.maxPull,
            status: match.status,
            winner: match.winner,
            currentQuestionIndex: match.currentQuestionIndex,
            totalQuestions: match.questions.length,
            currentQuestion
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getMatchByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        // Basic validation
        if (!teamId || teamId.length !== 24) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const match = await DeadlockMatch.findOne({
            $or: [{ teamA: teamId }, { teamB: teamId }],
            status: { $in: ["lobby", "ongoing"] }
        }).populate("teamA teamB", "name");

        if (!match) {
            return res.status(200).json({
                success: false,
                message: "No active match found."
            });
        }

        const isTeamA = match.teamA._id.toString() === teamId;
        const opponent = isTeamA ? match.teamB : match.teamA;

        res.json({
            matchId: match._id,
            status: match.status,
            team: isTeamA ? "A" : "B",
            opponentName: opponent ? opponent.name : "PENDING...",
            tugPosition: match.tugPosition,
            maxPull: match.maxPull
        });
    } catch (error) {
        console.error("Match by team error:", error);
        res.status(500).json({ message: "System error." });
    }
};
