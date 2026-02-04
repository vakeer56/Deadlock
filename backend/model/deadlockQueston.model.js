const mongoose = require('mongoose');

const deadlockQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    }
});

module.exports = mongoose.model('DeadlockQuestion', deadlockQuestionSchema);
