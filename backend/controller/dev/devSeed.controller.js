const Team = require("../../model/team.model");
const DeadlockMatch = require("../../model/deadlock.model");
const DeadlockQuestion = require("../../model/deadlockQuestion");

/* ----------------------------------------------------
DEV SEED: DEADLOCK
- Creates 2 dev teams
- Ensures coding questions exist
- Creates a match with question progression
---------------------------------------------------- */
exports.seedDeadlock = async (req, res) => {
    try {
    //lean previous dev data
    await Team.deleteMany({ name: /DEV_/ });
    await DeadlockMatch.deleteMany({});

    //ensure Deadlock questions exist
    const questionCount = await DeadlockQuestion.countDocuments();

    if (questionCount === 0) {
        await DeadlockQuestion.insertMany([
        {
            title: "Multiply Two Numbers",
            description: "Given two integers, print their product.",
            difficulty: "easy",
            testCases: [
            { input: "6 7", output: "42" },
            { input: "3 5", output: "15" }
            ]
        },
        {
            title: "Add Two Numbers",
            description: "Given two integers, print their sum.",
            difficulty: "easy",
            testCases: [
            { input: "2 3", output: "5" },
            { input: "10 20", output: "30" }
            ]
        },
        {
            title: "Maximum of Two Numbers",
            description: "Given two integers, print the maximum.",
            difficulty: "easy",
            testCases: [
            { input: "5 9", output: "9" },
            { input: "10 3", output: "10" }
            ]
        }
        ]);
    }

    //reate dev teams
    const teamA = await Team.create({
        name: "DEV_TEAM_A",
        members: ["Alice"]
    });

    const teamB = await Team.create({
        name: "DEV_TEAM_B",
        members: ["Bob"]
    });

    //Fetch questions for the match (ordered)
    const questions = await DeadlockQuestion.find().limit(5);

    if (questions.length === 0) {
        return res.status(400).json({
        message: "No deadlock questions available."
        });
    }

    //Create match WITH question progression
    const match = await DeadlockMatch.create({
        teamA: teamA._id,
        teamB: teamB._id,
        tugPosition: 0,
        maxPull: 3,
        status: "ongoing",
        questions: questions.map(q => q._id),
        currentQuestionIndex: 0
    });

    //Respond
    res.json({
        matchId: match._id,
        teamA: teamA._id,
        teamB: teamB._id,
        totalQuestions: questions.length
    });
    } catch (err) {
    console.error("Deadlock dev seed failed:", err);
    res.status(500).json({ message: "Deadlock dev seed failed" });
    }
};
