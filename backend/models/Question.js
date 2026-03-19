const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Exam'
    },
    text: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        // The index of the correct option in the options array
        type: Number, 
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    setNumber: {
        type: Number,
        enum: [1, 2, 3], // Set A, B, or C
        default: 1
    },
    marks: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
