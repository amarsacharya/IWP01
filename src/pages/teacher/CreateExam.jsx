import React, { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DifficultyChart from '../../components/analytics/DifficultyChart'; // Reuse chart!
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateExam = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: ''
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateAndNavigate = async (destinationPath) => {
        if (!formData.title || !formData.subject) {
            alert('Please fill out the Exam Title and Subject first.');
            return;
        }

        setIsCreating(true);
        try {
            // 1. Create the empty Exam Shell in the database first
            const examRes = await api.post('/exams/create', {
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                startTime: new Date(Date.now() + 86400000), // Default start in 24 hrs
                durationMinutes: 60
            });
            
            const newExamId = examRes.data._id;

            // 2. Navigate to the AI subordinate page passing the shell ID
            navigate(`${destinationPath}?examId=${newExamId}`);
        } catch (error) {
            console.error('Failed to create exam shell:', error);
            alert('Failed to establish exam shell. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Create New Exam Blueprint</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Exam Content</h2>

                        <Input
                            label="Exam Title"
                            placeholder="e.g., Final Year Programming Assessment"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="Brief description or instructions for students"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white text-black"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-2">
                            <Input
                                label="Subject / Topic"
                                placeholder="e.g., Biology"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Question Selection</h2>
                            <Button size="sm" variant="secondary" className="flex items-center">
                                <Plus size={16} className="mr-1" /> Add Manual Question
                            </Button>
                        </div>
                        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 flex flex-col items-center">
                            <p className="text-gray-500 mb-6 font-medium">How would you like to build this exam?</p>
                            <div className="flex justify-center flex-col gap-4 w-full max-w-xs">
                                <Button 
                                    className="w-full flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-700 font-bold" 
                                    onClick={() => handleCreateAndNavigate('/teacher/generate-syllabus')}
                                    isLoading={isCreating}
                                >
                                    ✨ ParixaAI (Paste Syllabus)
                                </Button>
                                <Button 
                                    className="w-full flex justify-center items-center py-3 bg-purple-600 hover:bg-purple-700 font-bold" 
                                    onClick={() => handleCreateAndNavigate('/teacher/upload-pdf')}
                                    isLoading={isCreating}
                                >
                                    📄 ParixaAI (Upload PDF)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;
