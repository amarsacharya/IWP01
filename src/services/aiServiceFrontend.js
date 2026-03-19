import api from './api';

export const aiServiceFrontend = {
    // Generate from block of text
    generateFromText: async (payload) => {
        // payload expects: { text: "...", topic: "...", count: 10 }
        const response = await api.post('/ai/generate-text', payload);
        return response.data;
    },

    // Generate from PDF File
    generateFromPDF: async (formData) => {
        // Expects formData containing a 'document' file and 'topic', 'count' fields
        // Must configure axios to send as multipart/form-data instead of JSON
        const response = await api.post('/ai/generate-pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
