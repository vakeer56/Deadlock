const DeadlockMatch = require("../../model/deadlock.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");
const DeadlockSubmission = require("../../model/deadlockSubmission.model");
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

        // 1️⃣ Validate match
        const match = await DeadlockMatch.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        if (match.status !== "ongoing") {
            return res.status(400).json({ message: "Match is not ongoing" });
        }

        // 2️⃣ Validate team
        const isTeamA = match.teamA.toString() === teamId;
        const isTeamB = match.teamB.toString() === teamId;

        if (!isTeamA && !isTeamB) {
            return res.status(403).json({ message: "Team not in this match" });
        }

        // 3️⃣ Get CURRENT question from match (AUTHORITATIVE)
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

        // 4️⃣ Run code against all test cases
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

        // 5️⃣ Save submission
        await DeadlockSubmission.create({
            matchId: matchId,
            teamId: teamId,
            questionId: currentQuestionId,
            language,
            verdict,
            answer: code,
            isCorrect: verdict === "AC"
        });

        // 6️⃣ If failed → stop here
        if (verdict !== "AC") {
            return res.json({
                success: false,
                verdict,
                error
            });
        }

        // 7️⃣ Move tug
        match.tugPosition += isTeamA ? 1 : -1;

        // 8️⃣ Advance question
        match.currentQuestionIndex += 1;

        // Prevent overflow
        if (match.currentQuestionIndex >= match.questions.length) {
            match.currentQuestionIndex =
                match.questions.length - 1;
        }

        // 9️⃣ Win condition
        if (Math.abs(match.tugPosition) >= match.maxPull) {
            match.status = "finished";
            match.winner = teamId;
            match.loser = isTeamA ? match.teamB : match.teamA;
        }

        await match.save();

        res.json({
            success: true,
            verdict: "AC",
            tugPosition: match.tugPosition,
            status: match.status,
            nextQuestionIndex: match.currentQuestionIndex
        });
    } catch (err) {
        console.error("Deadlock submit error:", err);
        res.status(500).json({ message: "Submission failed", error: err.message });
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
            status: match.status,
            winner: match.winner,
            currentQuestion
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


