const axios = require('axios');

module.exports = function(app) {
    app.get('/stalk/ff2', async (req, res) => {
        const uid = req.query.uid || req.query.id;
        const apikey = req.query.apikey;

        if (!uid || !/^\d+$/.test(uid)) {
            return res.status(400).json({
                status: false,
                creator: '@RyuuXiao',
                message: 'Parameter uid tidak valid (wajib angka)'
            });
        }

        if (!apikey || apikey !== global.apikeyf) {
            return res.status(403).json({
                status: false,
                creator: '@RyuuXiao',
                message: 'API key tidak valid'
            });
        }

        try {
            const url = `https://discordbot.freefirecommunity.com/player_info_api?uid=${uid}&region=id`;
            const response = await axios.get(url, {
                headers: {
                    'Origin': 'https://www.freefirecommunity.com',
                    'Referer': 'https://www.freefirecommunity.com/ff-account-info/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K)',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br'
                }
            });

            const d = response.data.player_info || {};
            const b = d.basicInfo || {};
            const prof = d.profileInfo || {};
            const p = d.petInfo || {};
            const c = d.creditScoreInfo || {};
            const s = d.socialInfo || {};

            const safe = (val, fallback = 'N/A') => val !== undefined && val !== null ? val : fallback;

            res.json({
                status: true,
                creator: '@RyuuXiao',
                data: {
                    nickname: safe(b.nickname),
                    accountId: safe(b.accountId),
                    level: safe(b.level),
                    rank: safe(b.rank),
                    csRank: safe(b.csRank),
                    liked: safe(b.liked),
                    maxRank: safe(b.maxRank),
                    region: safe(b.region),
                    avatarId: safe(prof.avatarId),
                    clothes: Array.isArray(prof.clothes) ? prof.clothes.join(', ') : '-',
                    pet: {
                        name: safe(p.name, '-'),
                        level: safe(p.level, '-'),
                        exp: safe(p.exp, '-'),
                        skillId: safe(p.selectedSkillId, '-')
                    },
                    creditScore: safe(c.creditScore),
                    bannerImage: `https://discordbot.freefirecommunity.com/banner_image_api?uid=${uid}&region=id`,
                    outfitImage: `https://discordbot.freefirecommunity.com/outfit_image_api?uid=${uid}&region=id`
                }
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                creator: '@RyuuXiao',
                message: `Gagal mengambil data: ${error.message}`
            });
        }
    });
};