const DeadlockMatch = require("../model/deadlock.model");
const Team = require("../model/team.model");

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
        // 1. Find all active matches to identify busy teams
        const activeMatches = await DeadlockMatch.find({
            status: { $in: ["lobby", "ongoing"] }
        }).select("teamA teamB");

        const busyTeamIds = activeMatches.reduce((acc, match) => {
            if (match.teamA) acc.push(match.teamA);
            if (match.teamB) acc.push(match.teamB);
            return acc;
        }, []);

        // 2. Fetch teams not in active matches
        const teams = await Team.find({
            currentRound: "deadlock",
            deadlockResult: "pending",
            _id: { $nin: busyTeamIds }
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

        if (match.tugPosition >= match.maxPull) {
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
        // 1. Get all eligible teams
        const teams = await Team.find({
            currentRound: "deadlock",
            deadlockResult: "pending"
        });

        if (teams.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Not enough teams to start matches"
            });
        }

        if (teams.length % 2 !== 0) {
            return res.status(400).json({
                success: false,
                message: "Odd number of teams — cannot pair evenly"
            });
        }

        const matches = [];

        // 2. Pair teams & create matches
        for (let i = 0; i < teams.length; i += 2) {
            const teamA = teams[i];
            const teamB = teams[i + 1];

            const match = await DeadlockMatch.create({
                teamA: teamA._id,
                teamB: teamB._id,
                tugPosition: 0,
                maxPull: 5,
                status: "lobby"
            });

            matches.push(match);
        }

        res.status(201).json({
            success: true,
            message: "All Deadlock matches started",
            totalMatches: matches.length,
            matches
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to start all matches",
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
