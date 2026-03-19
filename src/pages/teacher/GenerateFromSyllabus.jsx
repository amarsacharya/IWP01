import React, { useState } from 'react';
import { Sparkles, Save, AlignLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api'; 
import Button from '../../components/common/Button';
import { aiServiceFrontend } from '../../services/aiServiceFrontend';

const GenerateFromSyllabus = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const examId = searchParams.get('examId');

    const [syllabus, setSyllabus] = useState('');
    const [topic, setTopic] = useState('Syllabus Material');
    
    // Detailed Manual Configurations
    const [numSets, setNumSets] = useState(3);
    const [easyCount, setEasyCount] = useState(3);
    const [mediumCount, setMediumCount] = useState(4);
    const [hardCount, setHardCount] = useState(3);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [activeSetTab, setActiveSetTab] = useState(1);

    const totalPerSet = parseInt(easyCount) + parseInt(mediumCount) + parseInt(hardCount);
    const totalQuestions = totalPerSet * numSets;

    const handleGenerate = async () => {
        if (!syllabus || !topic) return;

        setIsGenerating(true);

        try {
            const data = await aiServiceFrontend.generateFromText({
                text: syllabus,
                topic: topic,
                numSets: parseInt(numSets),
                easyCount: parseInt(easyCount),
                mediumCount: parseInt(mediumCount),
                hardCount: parseInt(hardCount)
            });
            // data is an array of questions from the backend
            setGeneratedQuestions(data);
            setActiveSetTab(1); // Reset to first tab on generation
        } catch (error) {
            console.error("AI Generation Failed:", error);
            alert(error.response?.data?.message || "Failed to generate AI questions. Are you rate limited?");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSwapQuestion = (questionToSwap) => {
        // Find a reserve question in the SAME Set with the SAME Difficulty
        const reserveIndex = generatedQuestions.findIndex(q => 
            q.isReserve && 
            q.setNumber === questionToSwap.setNumber && 
            q.difficulty === questionToSwap.difficulty
        );

        if (reserveIndex === -1) {
            alert('No more reserve questions available for this difficulty level in this Set!');
            return;
        }

        // Clone array to trigger re-render
        const newQuestions = [...generatedQuestions];
        
        // Find the active question's index
        const activeIndex = newQuestions.findIndex(q => q.id === questionToSwap.id);
        
        // Swap their statuses
        newQuestions[activeIndex].isReserve = true;
        newQuestions[reserveIndex].isReserve = false;

        setGeneratedQuestions(newQuestions);
    };

    const handleSaveExam = async () => {
        if (!examId) {
            alert('Missing Exam ID Context. Please start from the Create Exam page.');
            navigate('/teacher/exam/create');
            return;
        }

        setIsSaving(true);
        try {
            // Only send the ACTIVE questions to the database (discarding the reserve buffer)
            const activeQuestionsToSave = generatedQuestions.filter(q => !q.isReserve);

            // 1. Attach the generated questions directly to the Shell we created beforehand
            await api.post(`/exams/${examId}/questions`, {
                questions: activeQuestionsToSave
            });

            alert('Successfully built Exam and safely saved all Question Sets to Database!');
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Failed to save exam:', error);
            alert('Failed to save the exam generated questions to database.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate Questions using ParixaAI</h1>
                <p className="text-gray-600 mb-6">Paste your curriculum or syllabus text, and ParixaAI will generate balanced, strict Multiple Choice Questions.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus Details (Paste text here)</label>
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                rows={8}
                                placeholder="Paste the syllabus sections, paragraphs from a textbook, or lecture notes here..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 bg-white text-black"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-fit space-y-4">
                        <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Input Settings</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Sets</label>
                            <input
                                type="number" min="1" max="10"
                                value={numSets}
                                onChange={(e) => setNumSets(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-black bg-white"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Questions Per Set (Difficulty)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <span className="text-xs text-green-600 font-semibold">Easy</span>
                                    <input type="number" min="0" value={easyCount} onChange={(e) => setEasyCount(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-center text-sm" />
                                </div>
                                <div>
                                    <span className="text-xs text-yellow-600 font-semibold">Medium</span>
                                    <input type="number" min="0" value={mediumCount} onChange={(e) => setMediumCount(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-center text-sm" />
                                </div>
                                <div>
                                    <span className="text-xs text-red-600 font-semibold">Hard</span>
                                    <input type="number" min="0" value={hardCount} onChange={(e) => setHardCount(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-center text-sm" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 text-right font-medium">
                                Total AI Load: {totalQuestions} Questions
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-gray-200">
                            <Button
                                fullWidth
                                onClick={handleGenerate}
                                className="flex items-center justify-center font-bold"
                                isLoading={isGenerating}
                                disabled={!topic || !syllabus.trim() || syllabus.length < 20}
                            >
                                {!isGenerating && <Sparkles size={18} className="mr-2" />}
                                Generate ParixaAI Magic
                            </Button>
                            {syllabus && syllabus.length < 20 && (
                                <p className="mt-2 text-xs text-red-500 text-center">Please provide more syllabus text.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {generatedQuestions.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
                        <h2 className="text-xl font-bold flex items-center mb-4 md:mb-0">
                            <Sparkles className="text-indigo-500 mr-2" size={24} />
                            Generated Questions
                        </h2>
                        
                        <div className="flex flex-wrap gap-2">
                            {[...Array(parseInt(numSets))].map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setActiveSetTab(i + 1)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors shadow-sm ${
                                        activeSetTab === i + 1 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Set {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {generatedQuestions.filter(q => q.setNumber === activeSetTab && !q.isReserve).map((q, localIndex) => {
                            
                            // Check if a reserve question exists for this difficulty/set to enable/disable button
                            const hasReserve = generatedQuestions.some(
                                resQ => resQ.isReserve && resQ.setNumber === activeSetTab && resQ.difficulty === q.difficulty
                            );

                            return (
                                <div key={q.id} className="p-5 rounded-lg border border-gray-200 hover:border-indigo-300 transition-shadow shadow-sm bg-white relative">
                                    <div className="flex justify-between mb-3 border-b border-gray-100 pb-3">
                                        <div className="font-medium text-gray-900 flex gap-2 items-center pr-16 text-lg">
                                            <span className="text-gray-500 font-bold">{localIndex + 1}.</span> {q.text}
                                        </div>
                                        <div className="flex items-start gap-2 flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded flex items-center h-fit uppercase tracking-wider ${q.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleSwapQuestion(q)}
                                                disabled={!hasReserve}
                                                className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
                                                    hasReserve 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                }`}
                                            >
                                                ♻️ Swap {hasReserve ? '(Available)' : '(Empty)'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className={`p-3 rounded border text-sm ${i === q.correctAnswer ? 'bg-green-50 border-green-300 text-green-900 font-medium' : 'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}>
                                                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex justify-center space-x-4">
                        <Button className="px-8" variant="secondary" onClick={() => setGeneratedQuestions([])} disabled={isSaving}>Discard All Sets</Button>
                        <Button className="px-8 flex items-center bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveExam} isLoading={isSaving}>
                            <Save size={18} className="mr-2" /> Save All Sets to Database
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateFromSyllabus;
