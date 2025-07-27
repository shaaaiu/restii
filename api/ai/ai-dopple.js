const fetch = require('node-fetch');

module.exports = function(app) {
    async function dopple(userQuery) {
        const headers = {
            "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
            Referer: "https://beta.dopple.ai/messages",
        };

        const body = JSON.stringify({
            streamMode: "none",
            chatId: "632cef078c294913b5b4653869eca845",
            folder: "",
            images: false,
            username: "mn0uvp2fhv",
            persona_name: "",
            id: "46db0561-cb3e-43d9-8f50-40b3e3c84713",
            userQuery,
        });

        try {
            const response = await fetch("https://beta.dopple.ai/api/messages/send", {
                method: "POST",
                headers,
                body,
            });
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    app.get('/ai/dopple', async (req, res) => {
        const { text, apikey } = req.query;

        // Validasi API key (pakai apikeyf)
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
            const message = await dopple(text);
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