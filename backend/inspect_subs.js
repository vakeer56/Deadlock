const mongoose = require('mongoose');
const DeadlockSubmission = require('./model/deadlockSubmission.model');
require('dotenv').config({ path: './.env' });

async function inspectSubmissions() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deadlock";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for inspection.");

        const submissions = await DeadlockSubmission.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        console.log(`Found ${submissions.length} recent submissions.\n`);

        submissions.forEach((s, i) => {
            console.log(`[${i + 1}] Title: ${s.verdict} | Language: ${s.language} | IsCorrect: ${s.isCorrect}`);
            if (s.verdict !== "AC") {
                console.log(`    Error/Verdict: ${s.verdict}`);
                // Note: deadlockSubmission model might not store the full error string if I didn't save it.
                // Let's check the schema.
            }
            console.log("------------------------------------------");
        });

        process.exit(0);
    } catch (err) {
        console.error("Inspection failed:", err);
        process.exit(1);
    }
}

inspectSubmissions();
