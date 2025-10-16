const axios = require('axios');

module.exports = function(app) {
    // Fungsi scrape utama
    async function scrapeLoginOrkut(username, password, apikey) {
        try {
            const url = `https://api.xiaoprivate.biz.id/orderkuota/getotp?apikey=RyuuXiao&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
            console.log('[LOGINORKUT SCRAPE] Fetching:', url);

            const response = await axios.get(url, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });

            return response.data;
        } catch (err) {
            console.error('[LOGINORKUT SCRAPE] Error:', err.message);
            throw new Error('Gagal mengambil data dari sumber eksternal');
        }
    }

    // Endpoint API
    app.get('/orderkuota/getotp', async (req, res) => {
        const { username, password, apikey } = req.query;

        // Validasi API key lokal (gunakan global.apikeyf sama seperti contohmu)
        if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
            return res.status(403).json({
                status: false,
                message: 'Apikey tidak valid.'
            });
        }

        // Validasi parameter
        if (!username || !password) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "username" dan "password" wajib diisi.'
            });
        }

        try {
            const data = await scrapeLoginOrkut(username, password, apikey);

            if (!data || data.error || !data.status) {
                return res.status(400).json({
                    status: false,
                    message: `Gagal mendapatkan OTP. Detail: ${data.message || 'Tidak diketahui'}`,
                    data
                });
            }

            const result = data.result || {};

            res.status(200).json({
                status: true,
                message: 'Berhasil mendapatkan OTP.',
                otp_method: result.otp,
                otp_value: result.otp_value,
                raw: data
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
