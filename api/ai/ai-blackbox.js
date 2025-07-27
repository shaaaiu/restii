const axios = require('axios');

module.exports = function(app) {
    async function blackbox(text) {
        const url = 'https://www.blackbox.ai/api/chat';
        const headers = {
            'authority': 'www.blackbox.ai',
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/json',
            'cookie': 'sessionId=1ef130b0-ffe7-4e75-ae34-51867f22bb04;',
            'origin': 'https://www.blackbox.ai',
            'referer': 'https://www.blackbox.ai/',
            'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        };

        const data = {
            messages: [{ role: 'user', content: text, id: 'Cw0hPk9' }],
            id: 'NMxpOEZ',
            codeModelMode: true,
            trendingAgentMode: {},
            isMicMode: false,
            maxTokens: 1024,
            isChromeExt: false,
            githubToken: '',
            clickedForceWebSearch: false,
            visitFromDelta: true,
            isMemoryEnabled: false,
            mobileClient: true,
            validated: 'a38f5889-8fef-46d4-8ede-bf4668b6a9bb',
            imageGenerationMode: false,
            webSearchModePrompt: false,
            deepSearchMode: false,
            vscodeClient: false,
            codeInterpreterMode: false,
            customProfile: {
                name: '',
                occupation: '',
                traits: [],
                additionalInfo: '',
                enableNewChats: false
            },
            webSearchModeOption: {
                autoMode: true,
                webMode: false,
                offlineMode: false
            },
            isPremium: false,
            beastMode: false,
            designerMode: false,
            asyncMode: false
        };

        const res = await axios.post(url, data, { headers });
        let answer = res.data;
        if (typeof answer !== 'string') answer = JSON.stringify(answer);

        answer = answer.replace(/\$~~~\$\[.*?\]\$~~~\$/gs, '*[ SEARCH MODE ]*');
        answer = answer.replace(/\*\*/g, '*');

        return answer;
    }

    app.get('/ai/blackbox', async (req, res) => {
        const { text, apikey } = req.query;

        // Validasi API key pakai global.apikeyf
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
            const result = await blackbox(text);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};