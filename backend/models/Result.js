const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Exam'
    },
    score: {
        type: Number,
        default: 0
    },
    totalPercentage: {
        type: Number,
        default: 0
    },
    // Useful for showing students an analysis of what they got right vs wrong
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selectedOptionIndex: {
            type: Number,
            default: null // null if they skipped it
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
