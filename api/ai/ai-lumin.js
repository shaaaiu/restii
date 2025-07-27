const axios = require('axios');

module.exports = function(app) {
    async function lumin(content) {
        try {
            const response = await axios.post('https://luminai.my.id/', {
                content
            });
            return response.data.result;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    app.get('/ai/lumin', async (req, res) => {
        const { text, apikey } = req.query;

        // Validasi API key
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
            const message = await lumin(text);
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