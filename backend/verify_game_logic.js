const mongoose = require('mongoose');
const DeadlockMatch = require('./model/deadlock.model');
const DeadlockQuestion = require('./model/deadlockQuestion');
const Team = require('./model/team.model');
require('dotenv').config();

const testGameLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Setup Test Teams
        const teamA = await Team.create({ name: "AlphaTest", currentRound: "deadlock" });
        const teamB = await Team.create({ name: "OmegaTest", currentRound: "deadlock" });

        // 2. Setup first question
        const qEasy = await DeadlockQuestion.findOne({ difficulty: "easy" });

        // 3. Create Match
        const match = await DeadlockMatch.create({
            teamA: teamA._id,
            teamB: teamB._id,
            questions: [qEasy._id],
            maxPull: 4,
            status: "ongoing"
        });

        console.log("Match Created:", match._id);

        // 4. Simulate Submits (Simulate solveProblem logic step-by-step)
        // We'll mimic the controller logic to verify state transitions

        const simulateSolve = async (mId, tId) => {
            const m = await DeadlockMatch.findById(mId);
            const isA = tId.toString() === m.teamA.toString();
            m.tugPosition += isA ? -1 : 1;

            const maxPull = m.maxPull || 4;
            let winner = null;
            if (m.tugPosition <= -maxPull) { winner = m.teamA; m.status = "finished"; }
            else if (m.tugPosition >= maxPull) { winner = m.teamB; m.status = "finished"; }

            if (m.status !== "finished") {
                m.currentQuestionIndex += 1;
                const absPos = Math.abs(m.tugPosition);
                let diff = "medium";
                if (absPos >= 3) diff = "hard";
                else if (absPos === 0) diff = "easy";

                // Mock fetching next question
                const nextQ = await DeadlockQuestion.findOne({ difficulty: diff, _id: { $nin: m.questions } });
                if (nextQ) m.questions.push(nextQ._id);
                console.log(`Step: Pos=${m.tugPosition}, NextDifficulty=${diff}, QCount=${m.questions.length}`);
            } else {
                console.log(`Step: Pos=${m.tugPosition}, STATUS=FINISHED, Winner=${winner}`);
            }
            await m.save();
        };

        console.log("--- Simulating Team B (Omega) Winning ---");
        for (let i = 0; i < 4; i++) {
            await simulateSolve(match._id, teamB._id);
        }

        const finalMatch = await DeadlockMatch.findById(match._id);
        if (finalMatch.status === "finished") {
            console.log("VERIFICATION SUCCESS: Game ended at score 4!");
        } else {
            console.log("VERIFICATION FAILED: Game did not end at score 4. Status:", finalMatch.status);
        }

        // Cleanup
        await DeadlockMatch.findByIdAndDelete(match._id);
        await Team.findByIdAndDelete(teamA._id);
        await Team.findByIdAndDelete(teamB._id);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testGameLogic();
