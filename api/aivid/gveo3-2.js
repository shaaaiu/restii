const axios = require('axios');
const crypto = require('crypto');

module.exports = function (app) {
    async function veo3(prompt) {
        try {
            if (!prompt) throw new Error('Prompt is required');

            const { data: cf } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
                params: {
                    mode: 'turnstile-min',
                    siteKey: '0x4AAAAAAANuFg_hYO9YJZqo',
                    url: 'https://aivideogenerator.me/features/g-ai-video-generator',
                    accessKey: 'e2ddc8d3ce8a8fceb9943e60e722018cb23523499b9ac14a8823242e689eefed'
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
                source: 'aivideogenerator.me',
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

            // Polling proses video
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

                await new Promise(res => setTimeout(res, 1000));
            }
        } catch (error) {
            console.error(error.message);
            throw new Error(error.message || 'Gagal memproses video VEO3');
        }
    }

    app.get('/aivid/gveo3-2', async (req, res) => {
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
                message: result // atau result.videoUrl jika hanya ingin URL videonya
            });
        } catch (err) {
            res.status(500).json({
                status: false,
                message: err.message
            });
        }
    });
};
