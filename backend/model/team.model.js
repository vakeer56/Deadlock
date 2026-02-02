const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: yes
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
            type: Boolean,
            required: yes
        }, 
        game: {
            type: String,
            required: true,
        }


    }
)