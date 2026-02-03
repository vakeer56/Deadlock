const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: mongoose.Types.ObjectId
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: Number,
            required: true,
            trim: yes
        }, 
        members: {
            type: [String],
            validate: [arr => arr.length <= 3, 'Max 3 members allowed']
        }, 
        isActive: {
            type: Boolean
        }, 
        game: {
            type: String,
            required: true,
            enum: ["deadlock", "crack-the-code", "pending"],
            default: "pending"
        }
        


    }
)

module.exports = mongoose.model('Team', teamSchema);