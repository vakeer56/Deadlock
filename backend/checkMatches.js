const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const DeadlockMatch = require('./model/deadlock.model');

const matchId = '6989fec6d00d1e3b958277bb';

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const match = await DeadlockMatch.findById(matchId);
            if (match) {
                console.log('Match found:', match);
            } else {
                console.log('Match NOT found');
            }

            // Also list all matches to see what's there
            const allMatches = await DeadlockMatch.find({});
            console.log('Total matches:', allMatches.length);
            console.log('All Match IDs:', allMatches.map(m => m._id));

        } catch (err) {
            console.error(err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
    });
