const DeadlockMatch = require("../../model/deadlock.model");
const Team = require("../../model/team.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");

exports.seedDeadlock = async (req, res) => {
    try {
        // 1. Create 2 Teams
        const teamA = await Team.create({
            name: "Alpha Test",
            members: ["A1", "A2"],
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        const teamB = await Team.create({
            name: "Omega Test",
            members: ["B1", "B2"],
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        // 2. Fetch some questions (if any)
        const questions = await DeadlockQuestion.find().limit(5);
        const questionIds = questions.map(q => q._id);

        // 3. Create Match
        const match = await DeadlockMatch.create({
            teamA: teamA._id,
            teamB: teamB._id,
            questions: questionIds,
            currentQuestionIndex: 0,
            tugPosition: 0,
            maxPull: 4,
            status: "ongoing"
        });

        res.json({
            success: true,
            message: "Seeded Deadlock Match",
            matchId: match._id,
            teamAId: teamA._id,
            teamBId: teamB._id,
            questionIds
        });

    } catch (error) {
        console.error("Seed failed:", error);
        res.status(500).json({
            success: false,
            message: "Seed failed",
            error: error.message
        });
    }
};
