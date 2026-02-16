const mongoose = require('mongoose');
const DeadlockQuestion = require('./model/deadlockQuestion');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const easy = await DeadlockQuestion.countDocuments({ difficulty: "easy" });
        const medium = await DeadlockQuestion.countDocuments({ difficulty: "medium" });
        const hard = await DeadlockQuestion.countDocuments({ difficulty: "hard" });
        console.log("STATS:", JSON.stringify({ easy, medium, hard }));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
};
run();
