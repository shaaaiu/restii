const axios = require('axios');
const crypto = require('crypto');

module.exports = function (app) {
    async function veo3(prompt) {
        try {
            if (!prompt) throw new Error('Prompt is required');

            const { data: cf } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
                params: {
                    mode: 'turnstile-min',
                    siteKey: '0x4AAAAAAAdJZmNxW54o-Gvd',
                    url: 'https://lunaai.video/features/v3-fast',
                    accessKey: '5238b8ad01dd627169d9ac2a6c843613d6225e6d77a6753c75dc5d3f23813653'
                }
            });

            const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex');

            const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
                prompt,
                imgUrls: [],
                quality: '720p',
                duration: 8,
                autoSoundFlag: false,
                soundPrompt: '',
                autoSpeechFlag: false,
                speechPrompt: '',
                speakerId: 'Auto',
                aspectRatio: '16:9',
                secondaryPageId: 1811,
                channel: 'VEO3',
                source: 'lunaai.video',
                type: 'features',
                watermarkFlag: false,
                privateFlag: false,
                isTemp: true,
                vipFlag: false,
                model: 'veo-3-fast'
            }, {
                headers: {
                    uniqueid: uid,
                    verify: cf.result.token
                }
            });

            // Polling hasil sampai "success"
            while (true) {
                const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
                    headers: {
                        uniqueid: uid,
                        verify: cf.result.token
                    }
                });

                if (data.data.state === 'success') {
                    return JSON.parse(data.data.completeData);
                }

                await new Promise(res => setTimeout(res, 1000)); // tunggu 1 detik
            }
        } catch (error) {
            console.error(error.message);
            throw new Error(error.message || 'Gagal memproses VEO3');
        }
    }

    app.get('/aivid/gveo3', async (req, res) => {
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
            const result = await veo3(text);
            res.status(200).json({
                status: true,
                message: result
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                message: err.message
            });
        }
    });
};
