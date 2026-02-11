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
        await DeadlockQuestion.deleteMany({});
        await DeadlockQuestion.insertMany([
            {
                "title": "Subtract Two Numbers",
                "description": "Given two integers, print their difference (first minus second).",
                "difficulty": "easy",
                "testCases": [
                    { "input": "10 4", "output": "6" },
                    { "input": "7 12", "output": "-5" }
                ]
            },
            {
                "title": "Check Even or Odd",
                "description": "Given an integer, print 'Even' if it is even, otherwise print 'Odd'.",
                "difficulty": "easy",
                "testCases": [
                    { "input": "6", "output": "Even" },
                    { "input": "9", "output": "Odd" }
                ]
            },
            {
                "title": "Sum of First N Numbers",
                "description": "Given an integer N, print the sum of the first N natural numbers.",
                "difficulty": "easy",
                "testCases": [
                    { "input": "5", "output": "15" },
                    { "input": "10", "output": "55" }
                ]
            },
            {
                "title": "Reverse a Number",
                "description": "Given an integer, print the reverse of the number.",
                "difficulty": "easy",
                "testCases": [
                    { "input": "123", "output": "321" },
                    { "input": "405", "output": "504" }
                ]
            },
            {
                "title": "Count Digits",
                "description": "Given an integer, print the number of digits in it.",
                "difficulty": "easy",
                "testCases": [
                    { "input": "12345", "output": "5" },
                    { "input": "9", "output": "1" }
                ]
            },
            {
                "title": "Prime Number Check",
                "description": "Given an integer, print 'YES' if it is prime, otherwise print 'NO'.",
                "difficulty": "medium",
                "testCases": [
                    { "input": "7", "output": "YES" },
                    { "input": "4", "output": "NO" }
                ]
            },
            {
                "title": "Palindrome String",
                "description": "Given a string, print 'YES' if it is a palindrome, otherwise print 'NO'.",
                "difficulty": "medium",
                "testCases": [
                    { "input": "racecar", "output": "YES" },
                    { "input": "hello", "output": "NO" }
                ]
            }
        ]);

        //reate dev teams
        const teamA = await Team.create({
            name: "DEV_TEAM_ALPHA",
            members: ["Alice"]
        });

        const teamB = await Team.create({
            name: "DEV_TEAM_OMEGA",
            members: ["Bob"]
        });

        //Fetch questions for the match (ordered)
        const questions = await DeadlockQuestion.find();

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
            maxPull: 100,
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
