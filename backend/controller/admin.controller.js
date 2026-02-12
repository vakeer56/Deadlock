const DeadlockMatch = require("../model/deadlock.model");
const Team = require("../model/team.model");
const DeadlockQuestion = require("../model/deadlockQuestion");
const DeadlockSubmission = require("../model/deadlockSubmission.model");

/* ----------------------------------------------------
CREATE DEADLOCK MATCH
---------------------------------------------------- */
exports.createMatch = async (req, res) => {
    try {
        const match = await DeadlockMatch.create({
            tugPosition: 0,
            maxPull: 5,
            status: "lobby"
        });

        res.status(201).json({
            success: true,
            match
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create match",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
RESET MATCH
---------------------------------------------------- */
exports.resetMatch = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await DeadlockMatch.findByIdAndUpdate(
            id,
            {
                tugPosition: 0,
                winner: null,
                loser: null,
                status: "ongoing"
            },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found"
            });
        }

        res.json({
            success: true,
            message: "Match reset successfully",
            match
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to reset match",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
ASSIGN TEAMS TO MATCH
---------------------------------------------------- */
exports.updateTeams = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamA, teamB } = req.body;

        if (!teamA || !teamB) {
            return res.status(400).json({
                success: false,
                message: "Both teamA and teamB are required"
            });
        }

        const teamAExists = await Team.findOne({
            _id: teamA,
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        const teamBExists = await Team.findOne({
            _id: teamB,
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        if (!teamAExists || !teamBExists) {
            return res.status(404).json({
                success: false,
                message: "One or both teams are not eligible for Deadlock"
            });
        }

        const match = await DeadlockMatch.findByIdAndUpdate(
            id,
            {
                teamA,
                teamB,
                status: "ongoing"
            },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found"
            });
        }

        res.json({
            success: true,
            match
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update teams",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
SWAP TEAMS
---------------------------------------------------- */
exports.swapTeams = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await DeadlockMatch.findById(id);

        if (!match || !match.teamA || !match.teamB) {
            return res.status(404).json({
                success: false,
                message: "Match or teams not found"
            });
        }

        const temp = match.teamA;
        match.teamA = match.teamB;
        match.teamB = temp;

        await match.save();

        res.json({
            success: true,
            match
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to swap teams",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
FINISH MATCH (PROMOTION LOGIC)
---------------------------------------------------- */
exports.finishMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { winner } = req.body;

        if (!winner) {
            return res.status(400).json({
                success: false,
                message: "Winner team ID is required"
            });
        }

        const match = await DeadlockMatch.findById(id);

        if (!match || !match.teamA || !match.teamB) {
            return res.status(404).json({
                success: false,
                message: "Match or teams not found"
            });
        }

        const loser =
            winner.toString() === match.teamA.toString()
                ? match.teamB
                : match.teamA;

        match.status = "finished";
        match.winner = winner;
        match.loser = loser;

        // SYMBOLIC FIX: Set tugPosition to the win threshold for consistent UI
        if (winner.toString() === match.teamA?.toString()) {
            match.tugPosition = -match.maxPull;
        } else {
            match.tugPosition = match.maxPull;
        }

        await match.save();

        await Team.findByIdAndUpdate(winner, {
            currentRound: "crack-the-code",
            deadlockResult: "win"
        });

        await Team.findByIdAndUpdate(loser, {
            currentRound: "eliminated",
            deadlockResult: "lose"
        });

        res.json({
            success: true,
            message: "Match finished and teams updated",
            match
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to finish match",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
GET DEADLOCK TEAMS (ELIGIBLE ONLY)
---------------------------------------------------- */
exports.getTeam = async (req, res) => {
    try {
        // Fetch all teams eligible for deadlock round (pending results)
        // Teams start in 'pending' round and move to 'deadlock' when initialized
        const teams = await Team.find({
            currentRound: "pending",
            deadlockResult: "pending"
        }).select("name members currentRound");

        res.json({
            success: true,
            teams
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch deadlock teams",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
GET ACTIVE DEADLOCK MATCHES
---------------------------------------------------- */
exports.getMatches = async (req, res) => {
    try {
        // Only fetch matches from the last 2 hours to avoid stale/duplicate historical data
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const matches = await DeadlockMatch.find({
            status: { $in: ["lobby", "ongoing", "finished"] },
            createdAt: { $gte: twoHoursAgo }
        })
            .sort({ createdAt: -1 }) // Show newest first
            .populate("teamA", "name members currentRound")
            .populate("teamB", "name members currentRound");

        res.json({
            success: true,
            matches
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch active matches",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
TERMINATE SESSION (NUCLEAR RESET)
---------------------------------------------------- */
exports.terminateSession = async (req, res) => {
    try {
        // 1. Delete all matches and submissions
        await DeadlockMatch.deleteMany({});
        await DeadlockSubmission.deleteMany({});

        // 2. Deep reset all teams to factory defaults for the round
        await Team.updateMany({}, {
            deadlockResult: 'pending',
            currentRound: 'pending',
            currentQuestionIndex: 0,
            questions: []
        });

        res.json({
            success: true,
            message: "Session terminated. All systems reset to baseline."
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to terminate session",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
CREATE TEAM
---------------------------------------------------- */
exports.createTeam = async (req, res) => {
    try {
        const { name, members } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Team name is required"
            });
        }

        const team = await Team.create({
            name,
            members: members || [],
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        res.status(201).json({
            success: true,
            team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create team",
            error: error.message
        });
    }
};

exports.solveProblem = async (req, res) => {
    try {
        const { matchId, solvingTeamId } = req.body;

        const match = await DeadlockMatch.findById(matchId);

        if (!match || match.status !== "ongoing") {
            return res.status(400).json({
                success: false,
                message: "Match not active"
            });
        }

        match.tugPosition += 1;

        if (Math.abs(match.tugPosition) >= match.maxPull) {
            const winner = solvingTeamId;
            const loser =
                solvingTeamId.toString() === match.teamA.toString()
                    ? match.teamB
                    : match.teamA;

            match.status = "finished";
            match.winner = winner;
            match.loser = loser;
            await match.save();

            // Promote winner
            await Team.findByIdAndUpdate(winner, {
                currentRound: "crack-the-code",
                deadlockResult: "win"
            });

            // Eliminate loser
            await Team.findByIdAndUpdate(loser, {
                currentRound: "eliminated",
                deadlockResult: "lose"
            });

            return res.json({
                success: true,
                message: "Match won! Team advanced to Crack the Code",
                winner
            });
        }

        // If not yet won
        await match.save();

        res.json({
            success: true,
            message: "Problem solved, game continues",
            tugPosition: match.tugPosition
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to process solve",
            error: err.message
        });
    }
};


/* ----------------------------------------------------
START ALL DEADLOCK MATCHES (BATCH)
---------------------------------------------------- */
exports.startAllDeadlockMatches = async (req, res) => {
    try {
        const { teamAIds, teamBIds } = req.body;

        if (!teamAIds || !teamBIds || teamAIds.length !== teamBIds.length) {
            return res.status(400).json({
                success: false,
                message: "Valid team Alpha and Team Omega pairings are required"
            });
        }

        // --- Authoritative Question Seeding ---
        await DeadlockQuestion.deleteMany({});
        const questions = await DeadlockQuestion.insertMany([
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

        const questionIds = questions.map(q => q._id);

        const matches = [];

        // Pair teams & create matches
        for (let i = 0; i < teamAIds.length; i++) {
            const teamAId = teamAIds[i];
            const teamBId = teamBIds[i];

            // CLEANUP: Force-delete ALL previous matches (ongoing OR finished) for these teams
            // This prevents "false entries" from previous games appearing in the tracker
            await DeadlockMatch.deleteMany({
                $or: [
                    { teamA: { $in: [teamAId, teamBId] } },
                    { teamB: { $in: [teamAId, teamBId] } }
                ]
            });

            // GUARD: Prevent a team from playing itself
            if (teamAId.toString() === teamBId.toString()) continue;

            // Officially move teams to deadlock round
            await Team.updateMany(
                { _id: { $in: [teamAId, teamBId] } },
                { currentRound: "deadlock" }
            );

            const match = await DeadlockMatch.create({
                teamA: teamAId,
                teamB: teamBId,
                questions: questionIds,
                currentQuestionIndex: 0,
                tugPosition: 0,
                maxPull: 100,
                status: "ongoing" // Set as ongoing by default to match devSeed flow
            });

            matches.push(match);
        }

        res.status(201).json({
            success: true,
            message: "Deadlock matches initialized successfully with questions",
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to initialize matches",
            error: err.message
        });
    }
};

/* ----------------------------------------------------
CHECK TEAM EXISTENCE
---------------------------------------------------- */
exports.checkTeam = async (req, res) => {
    try {
        const { name } = req.params;

        // Case-insensitive search
        const team = await Team.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (team) {
            return res.json({
                success: true,
                exists: true,
                team: {
                    _id: team._id,
                    name: team.name,
                    currentRound: team.currentRound
                }
            });
        }

        res.json({
            success: true,
            exists: false
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to check team",
            error: error.message
        });
    }
};
