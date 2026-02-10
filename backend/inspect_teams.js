require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./model/team.model");
const fs = require("fs");

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const teams = await Team.find();
        let report = "TEAM INSPECTION REPORT:\n";
        teams.forEach(t => {
            report += `[NAME: ${t.name}] [RESULT: "${t.deadlockResult}"] [ROUND: "${t.currentRound}"] [ACTIVE: ${t.isActive}]\n`;
        });
        fs.writeFileSync("inspection_log.txt", report);
        console.log("Report written to inspection_log.txt");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
