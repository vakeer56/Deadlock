const DeadlockMatch = require("../model/deadlock.model");
const Team = require("../model/team.model");

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

exports.resetMatch = async (req, res) => {
    try {
    const { id } = req.params;

    const match = await DeadlockMatch.findByIdAndUpdate(
        id,
        {
        tugPosition: 0,
        winner: null,
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


exports.updateTeams = async (req, res) => {
    try {
    const { id } = req.params;
    const { teamA, teamB } = req.body;

    // Validate teams exist

    const teamAExists = await Team.findOne({_id: teamA, game: "deadlock"});
    const teamBExists = await Team.findOne({_id: teamB, game: "deadlock"});

    if (!teamAExists || !teamBExists) {
        return res.status(404).json({
        success: false,
        message: "One or both teams not found"
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

exports.finishMatch = async (req, res) => {
    try {
    const { id } = req.params;
    const { winner } = req.body; // optional

    const match = await DeadlockMatch.findByIdAndUpdate(
        id,
        {
        status: "finished",
        winner: winner || null
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
        message: "Match finished",
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

exports.getTeam = async (req, res) => {
    try {
        const teams = await Team.find({game: "deadlock"})
            .select("name members game")

        res.json({
            success: true,
            teams
        });
        } catch(err) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch deadlock teams",
                err
            })
        };
    };

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
        game: "deadlock"
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



