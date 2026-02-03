const deadlockSubmissionSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeadlockMatch',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeadlockQuestion',
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean
    }
}, { timestamps: true });

module.exports = mongoose.model('DeadlockSubmission', deadlockSubmissionSchema);
