const axios = require('axios');

module.exports = function(app) {
    // Fungsi scrape utama
    async function scrapeVerifOTP(username, apikey, otp) {
        try {
            const url = `https://api.xiaoprivate.biz.id/orderkuota/gettoken?apikey=RyuuXiao&username=${encodeURIComponent(username)}&otp=${encodeURIComponent(otp)}`;
            console.log('[VERIFOTP SCRAPE] Fetching:', url);

            const response = await axios.get(url, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });

            return response.data;
        } catch (err) {
            console.error('[VERIFOTP SCRAPE] Error:', err.message);
            throw new Error('Gagal mengambil data dari sumber eksternal');
        }
    }

    // Endpoint API
    app.get('/orderkuota/gettoken', async (req, res) => {
        const { apikey, username, otp } = req.query;

        // 🔑 Validasi apikey internal
        if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
            return res.status(403).json({
                creator: "RyuuXiao",
                status: false,
                message: "Apikey tidak valid."
            });
        }

        // 🔎 Validasi parameter
        if (!username || !otp) {
            return res.status(400).json({
                creator: "RyuuXiao",
                status: false,
                message: 'Parameter "username" dan "otp" wajib diisi.'
            });
        }

        try {
            const data = await scrapeVerifOTP(username, apikey, otp);

            if (!data || data.error || !data.status) {
                return res.status(400).json({
                    creator: "RyuuXiao",
                    status: false,
                    result: data.result || {},
                    message: data.message || 'Gagal verifikasi OTP.'
                });
            }

            const r = data.result || {};

            // ✅ Simpan token ke global (opsional)
            global.tokenorkut = r.token;
            console.log('[VERIFOTP SCRAPE] Token Disimpan:', global.tokenorkut);

            // 🔄 Bentuk JSON hasil sesuai gaya api.xiaoprivate.biz.id
            res.status(200).json({
                creator: "RyuuXiao",
                status: true,
                result: {
                    otp: r.otp || "",
                    id: r.id || "",
                    name: r.name || "",
                    username: r.username || "",
                    balance: r.balance || "",
                    token: r.token || ""
                }
            });
        } catch (error) {
            res.status(500).json({
                creator: "RyuuXiao",
                status: false,
                message: error.message
            });
        }
    });
};
