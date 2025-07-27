const axios = require('axios');

module.exports = function(app) {
    async function tanyaIslam(text) {
        try {
            const response = await axios.post(
                'https://vercel-server-psi-ten.vercel.app/chat',
                {
                    text,
                    array: [
                        {
                            content: "What is Islam? Tell with reference to a Quran Ayat and explanation.",
                            text: text
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'origin': 'https://islamandai.com',
                        'referer': 'https://islamandai.com',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
                    }
                }
            );

            return response.data.result;
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || err.message || 'Gagal terhubung ke server Islam');
        }
    }

    app.get('/ai/islam', async (req, res) => {
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
            const message = await tanyaIslam(text);
            res.status(200).json({
                status: true,
                message
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
