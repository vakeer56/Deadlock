require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./model/team.model");
const CrackCodeSession = require("./model/CrackCodeSession");

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const teams = await Team.find();
        console.log(`Total Teams: ${teams.length}`);
        teams.forEach(t => {
            console.log(`- Team: ${t.name}, Round: ${t.currentRound}, Result: ${t.deadlockResult}`);
        });

        const eligibleTeams = await Team.find({ currentRound: 'crack-the-code' });
        console.log(`Eligible Teams for Crack the Code: ${eligibleTeams.length}`);

        const sessions = await CrackCodeSession.find();
        console.log(`Total CrackCodeSessions: ${sessions.length}`);

        process.exit(0);
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
};

checkDB();
