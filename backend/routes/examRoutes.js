const express = require('express');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware checking if user is teacher or admin (who are allowed to modify exams)
const isEducator = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Educator access strictly required.' });
    }
};

// Route: POST /api/exams/create
// Desc : Create a new empty exam shell
router.post('/create', protect, isEducator, async (req, res) => {
    try {
        const { title, description, subject, startTime, durationMinutes } = req.body;
        
        const exam = await Exam.create({
            title,
            description,
            subject,
            startTime,
            durationMinutes,
            creator: req.user._id, // Set automatically from token verification
            status: 'draft' 
        });

        res.status(201).json(exam);
    } catch (error) {
        console.error('Failed to create Exam shell:', error);
        res.status(500).json({ message: 'Server error creating exam' });
    }
});

// Route: POST /api/exams/:id/questions
// Desc : Save an array of AI Generated (or Manual) Questions into the specified Exam
router.post('/:id/questions', protect, isEducator, async (req, res) => {
    try {
        const examId = req.params.id;
        const questionsData = req.body.questions; // Expects an Array of Question Objects

        if (!questionsData || questionsData.length === 0) {
            return res.status(400).json({ message: 'No questions provided' });
        }

        // Verify the exam actually exists, and belongs to this teacher
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (exam.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Cannot modify another teachers exam.' });
        }

        // Loop through all questions sent from the frontend draft and attach Exam ID before saving to DB
        const questionsToSave = questionsData.map(q => ({
            examId: exam._id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty,
            setNumber: q.setNumber || 1, 
        }));

        // Batch insert is faster than `.save()` in a loop
        const savedQuestions = await Question.insertMany(questionsToSave);

        // Optionally, once populated, publish the exam
        exam.status = 'published';
        await exam.save();

        res.status(201).json({ 
            message: `Successfully saved ${savedQuestions.length} Questions and Published Exam!`,
            savedQuestions 
        });

    } catch (error) {
        console.error('Failed to save questions:', error);
        res.status(500).json({ message: 'Server error attaching questions to exam' });
    }
});

module.exports = router;
