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
const { validateSubmission } = require("../../utils/solutionRunner");

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
        const currentQuestionId = match.questions[match.currentQuestionIndex];

        // Validate correct question submit
        if (currentQuestionId.toString() !== questionId) {
            return res.status(409).json({
                message: "Question mismatch or already solved. Please refresh.",
                currentQuestionIndex: match.currentQuestionIndex
            });
        }

        const question = await DeadlockQuestion.findById(currentQuestionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        let verdict = "AC";
        let error = null;

        // Run code against all test cases (1 visible, 2 hidden)
        for (const testCase of question.testCases) {
            const validation = await validateSubmission({
                language,
                code,
                question,
                testCase
            });

            if (!validation.success) {
                verdict = validation.verdict;
                error = validation.error || `Failed on ${testCase.isHidden ? 'hidden' : 'visible'} test case`;
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
            isCorrect: verdict === "AC",
            error: error
        });

        // If failed -> stop here
        if (verdict !== "AC") {
            return res.json({
                success: false,
                verdict,
                error
            });
        }

        // Move tug
        if (isTeamA) {
            match.tugPosition -= 1; // Alpha pulls negative
            match.scoreA += 1;
            match.pullHistory.push('A');
        } else {
            match.tugPosition += 1; // Omega pulls positive
            match.scoreB += 1;
            match.pullHistory.push('B');
        }

        // Win condition check (-3 or 3)
        let winnerId = null, loserId = null;
        const maxPull = match.maxPull || 4;

        if (match.tugPosition <= -maxPull) {
            winnerId = match.teamA;
            loserId = match.teamB;
            match.status = "finished";
        } else if (match.tugPosition >= maxPull) {
            winnerId = match.teamB;
            loserId = match.teamA;
            match.status = "finished";
        } else {
            // Advance to next question only if not finished
            match.currentQuestionIndex += 1;

            // DYNAMIC DIFFICULTY SHIFTING
            // Map absolute tugPosition to difficulty
            // 0 -> Medium, 1 -> Medium, 2 -> Hard
            const absPos = Math.abs(match.tugPosition);
            let nextDifficulty = "medium";
            if (absPos >= 2) nextDifficulty = "hard";
            else if (absPos === 0) nextDifficulty = "easy"; // Let's start with Easy at 0 for better flow, or Medium if preferred

            // Fetch a random question of the target difficulty that hasn't been used in this match
            const usedQuestionIds = match.questions.slice(0, match.currentQuestionIndex);
            const nextQuestion = await DeadlockQuestion.findOne({
                difficulty: nextDifficulty,
                _id: { $nin: usedQuestionIds }
            }).skip(Math.floor(Math.random() * 10)); // Add some randomness from the pool

            if (nextQuestion) {
                // Insert the new question into the match's pool at the current index
                // This ensures both teams see this same new question
                match.questions.set(match.currentQuestionIndex, nextQuestion._id);
            } else {
                // Fallback: use an existing one if pool is somehow empty (unlikely with 150)
                console.warn(`No unused ${nextDifficulty} questions found, skipping replacement.`);
            }
        }

        if (match.status === "finished") {
            match.winner = winnerId;
            match.loser = loserId;

            // Update team records
            await Team.findByIdAndUpdate(winnerId, {
                currentRound: "crack-the-code",
                deadlockResult: "win"
            });

            await Team.findByIdAndUpdate(loserId, {
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
            nextQuestionIndex: match.currentQuestionIndex,
            winner: winnerId,
            loser: loserId
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

        const currentQuestion =
            match.questions[match.currentQuestionIndex];

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
            currentQuestion,
            pullHistory: match.pullHistory
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
