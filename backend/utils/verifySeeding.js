const mongoose = require('mongoose');
require('dotenv').config();

const verify = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deadlock";
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const collection = db.collection('deadlockquestions');

        const titles = ['Move Zeros End', 'Reverse String', 'Is Perfect Square', 'Double Sum'];
        const samples = await collection.find({ title: { $in: titles } }).toArray();

        console.log(`Found ${samples.length} samples for verification:`);
        samples.forEach(s => {
            console.log(`\n--- [${s.difficulty.toUpperCase()}] ${s.title} ---`);
            console.log(`Category: ${s.category}`);
            console.log(`FunctionName: ${s.functionName}`);
            console.log(`Test Cases:`);
            s.testCases.forEach((tc, i) => {
                console.log(`  Case ${i + 1}: Input: ${tc.input} | Expected: ${tc.output} | Hidden: ${tc.isHidden}`);
            });
        });

        const total = await collection.countDocuments();
        console.log(`\nTotal Questions in DB: ${total}`);

        process.exit(0);
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
};

verify();
