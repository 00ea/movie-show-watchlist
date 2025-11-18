const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    genre: {
        type: String,
        required: true
    },

    releaseYear: {
        type: Number,
        required: true
    },

    director: String,

    length: String,

    imdbRating: {
        type: Number,
        min: 0,
        max: 10
    },

    status: {
        type: String,
        enum: [
            'Not Started',
            'In Progress',
            'Completed'
        ],
        default: 'Not Started '
    },

    currentSeason: Number,

    currentEpisode: Number,

    personalRating: {
        type: Number,
        min: 0,
        max: 10
    },
    
    dateWatched: Date,
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Show', showSchema, 'shows')