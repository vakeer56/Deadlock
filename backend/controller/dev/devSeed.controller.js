const Team = require("../../model/team.model");
const DeadlockMatch = require("../../model/deadlock.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");

/* ----------------------------------------------------
DEV SEED: DEADLOCK
- Creates 2 dev teams
- Ensures at least 1 coding question exists
- Creates an ongoing match
---------------------------------------------------- */
exports.seedDeadlock = async (req, res) => {
    try {
    // Clean previous dev data
    await Team.deleteMany({ name: /DEV_/ });
    await DeadlockMatch.deleteMany({});

    //Ensure at least one DeadlockQuestion exists
    const questionCount = await DeadlockQuestion.countDocuments();

    if (questionCount === 0) {
        await DeadlockQuestion.create({
        title: "Multiply Two Numbers",
        description: "Given two integers, print their product.",
        difficulty: "easy",
        testCases: [
            { input: "6 7", output: "42" },
            { input: "3 5", output: "15" }
        ]
        });
    }

    //Create dev teams
    const teamA = await Team.create({
        name: "DEV_TEAM_A",
        members: ["Alice"]
    });

    const teamB = await Team.create({
        name: "DEV_TEAM_B",
        members: ["Bob"]
    });

    //Fetch a question
    const question = await DeadlockQuestion.findOne();
    if (!question) {
        return res.status(400).json({
        message: "No deadlock questions found."
        });
    }

    //Create match
    const match = await DeadlockMatch.create({
        teamA: teamA._id,
        teamB: teamB._id,
        tugPosition: 0,
        maxPull: 3,
        status: "ongoing"
    });

    //Respond with IDs
    res.json({
        matchId: match._id,
        teamA: teamA._id,
        teamB: teamB._id,
        questionId: question._id
    });
    } catch (err) {
    console.error("Deadlock dev seed failed:", err);
    res.status(500).json({ message: "Deadlock dev seed failed" });
    }
};
