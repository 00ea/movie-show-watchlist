const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['movie', 'show'],
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    genre: {
        type: [String],
        required: true
    },

    releaseYear: {
        type: Number,
        required: true,
        min: 1888, // first ever movie
        max: new Date().getFullYear() + 5 // future releases
    },

    director: {
        type: String,
        trim: true
    },

    duration: String,

    imdbRating: {
        type: Number,
        min: 0,
        max: 10
    },

    personalRating: {
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
        default: 'Not Started'
    },

    totalSeasons: Number,
    totalEpisodes: Number,
    currentSeason: Number,
    currentEpisode: Number,
    
    dateWatched: Date,
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

itemSchema.index({title: 'text'})
itemSchema.index({type: 1, status: 1})
itemSchema.index({dateAdded: -1})

// nice visual for showing show progress
itemSchema.virtual('completionPercentage').get(function(){
    if (this.type === 'show' && this.totalEpisodes && this.currentEpisode) {
        return Math.round((this.currentEpisode / this.totalEpisodes)*100);
    }
    return null;
});

// completetion check
itemSchema.methods.markAsCompleted = function() {
    this.status = 'Completed';
    this.dateWatched = new Date();
    return this.save();
};

module.exports = mongoose.model('Item', itemSchema,)