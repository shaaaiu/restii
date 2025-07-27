const axios = require('axios');

module.exports = function (app) {
    const modelKey = 'ChatGPT-4o';
    const modelValue = 'chatgpt-4o';

    async function askAI(prompt) {
        try {
            const { data } = await axios.post(
                'https://whatsthebigdata.com/api/ask-ai/',
                {
                    message: prompt,
                    model: modelValue,
                    history: []
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'origin': 'https://whatsthebigdata.com',
                        'referer': 'https://whatsthebigdata.com/ai-chat/',
                        'user-agent': 'Mozilla/5.0'
                    }
                }
            );

            if (data?.text) {
                return `*Model:* ${modelKey}\n*Jawaban:*\n${data.text}`;
            } else {
                throw new Error('Tidak ada respon dari model.');
            }
        } catch (e) {
            if (e.response?.status === 400) {
                throw new Error('Prompt dilarang oleh model.');
            }
            throw new Error(e.message);
        }
    }

    app.get('/ai/chatgpt', async (req, res) => {
        const { text, apikey } = req.query;

        if (!global.apikeyf || !global.apikeyf.includes(apikey)) {
            return res.status(403).json({
                status: false,
                message: 'Apikey tidak valid.'
            });
        }

        if (!text) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "text" diperlukan.'
            });
        }

        try {
            const response = await askAI(text);
            res.status(200).json({
                status: true,
                message: response
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};