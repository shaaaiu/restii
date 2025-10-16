const axios = require('axios');
const https = require('https');

module.exports = function (app) {

    // Fungsi scrape profile dari api.xiaoprivate.biz.id
    async function scrapeProfile(username, token, apikey) {
        const url = `https://api.xiaoprivate.biz.id/orderkuota/profile?apikey=RyuuXiao&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`;
        console.log('[PROFILE SCRAPE] Fetching:', url);

        try {
            const response = await axios.get(url, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://api.xiaoprivate.biz.id",
                    "Origin": "https://api.xiaoprivate.biz.id"
                },
                timeout: 10000,
                httpsAgent: new https.Agent({ rejectUnauthorized: false }) // bypass SSL verify
            });

            return response.data;
        } catch (err) {
            console.error('[PROFILE SCRAPE] Full Error:', err.response?.data || err.message);
            throw new Error(err.response?.data?.message || 'Gagal mengambil data dari sumber eksternal');
        }
    }

    // Endpoint API
    app.get('/orderkuota/profile', async (req, res) => {
        const { apikey, username, token } = req.query;

        // Validasi apikey lokal
        if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
            return res.status(403).json({
                status: false,
                message: 'Apikey tidak valid.'
            });
        }

        // Validasi parameter
        if (!username || !token) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "username" dan "token" wajib diisi.'
            });
        }

        try {
            const data = await scrapeProfile(username, token, apikey);

            if (!data || data.status === false || data.error) {
                return res.status(400).json({
                    status: false,
                    message: data.message || 'Gagal mendapatkan data profile.',
                    data
                });
            }

            const result = data.result || {};
            res.status(200).json({
                status: true,
                message: 'Berhasil mendapatkan data profile.',
                username: result.username,
                name: result.name,
                email: result.email,
                phone: result.phone,
                balance: result.balance,
                raw: data
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message || 'Terjadi kesalahan saat memproses permintaan.'
            });
        }
    });
};
