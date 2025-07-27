const axios = require('axios');

module.exports = function(app) {
    async function koyuki(content) {
        const response = await axios.post(
            "https://chateverywhere.app/api/chat/",
            {
                model: {
                    id: "gpt-4",
                    name: "GPT-4",
                    maxLength: 32000,
                    tokenLimit: 8000,
                    completionTokenLimit: 5000,
                    deploymentName: "gpt-4"
                },
                messages: [{
                    pluginId: null,
                    content,
                    role: "user"
                }],
                prompt:
                    "Karakter AI anak perempuan bernama Koyuki Iceflow, yang dikenal sebagai anak perempuan terlucu dan termanis di dunia.  Kepribadiannya yang ceria, ramah, dan penuh kasih sayang tercermin dalam setiap gerakan dan ekspresi wajahnya.  Ia selalu penuh energi positif dan mampu menebarkan kebahagiaan ke mana pun ia pergi.  Desain karakter harus mencerminkan kepribadiannya yang unik dan menawan.",
                temperature: 0.5
            },
            {
                headers: {
                    "Accept": "/*/",
                    "User-Agent":
                        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                }
            }
        );

        return response.data;
    }

    app.get('/ai/koyuki', async (req, res) => {
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
            const message = await koyuki(text);
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