const mongoose = require('mongoose');
const DeadlockMatch = require('./model/deadlock.model');
const Team = require('./model/team.model');
const DeadlockQuestion = require('./model/deadlockQuestion');
require('dotenv').config();

const testInit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const allQuestions = await DeadlockQuestion.find({});
        console.log(`Total Questions: ${allQuestions.length}`);

        const easyQuestions = allQuestions.filter(q => q.difficulty === "easy");
        console.log(`Easy Questions: ${easyQuestions.length}`);

        if (easyQuestions.length === 0) {
            console.error("CRITICAL: No easy questions found! This will crash startAllDeadlockMatches.");
        } else {
            const firstQuestion = easyQuestions[Math.floor(Math.random() * easyQuestions.length)];
            console.log(`Sample Easy Question: ${firstQuestion.title} (${firstQuestion._id})`);
        }

        // Mock team IDs
        const teamAIds = ["699e8ba52f1d83ff132c0396"]; // from previous sample
        const teamBIds = ["699e8ba52f1d83ff132c0397"]; // assuming sequential or similar exists

        // Test the loop logic without actually saving to DB for now
        for (let i = 0; i < teamAIds.length; i++) {
            const teamAId = teamAIds[i];
            const teamBId = teamBIds[i];

            console.log(`Processing Pair: ${teamAId} vs ${teamBId}`);

            if (teamAId.toString() === teamBId.toString()) {
                console.log("Skipping same team");
                continue;
            }

            if (easyQuestions.length === 0) {
                throw new Error("Cannot access _id of undefined easy question");
            }

            console.log("Success: Logic passed for this pair.");
        }

        console.log("Test completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

testInit();
