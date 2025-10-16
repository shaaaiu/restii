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
        const { username, apikey, otp } = req.query;

        // 🔑 Validasi apikey internal (sama seperti koyuki & loginorkut)
        if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
            return res.status(403).json({
                status: false,
                message: 'Apikey tidak valid.'
            });
        }

        // 🔎 Validasi parameter wajib
        if (!username || !otp) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "username" dan "otp" wajib diisi.'
            });
        }

        try {
            const data = await scrapeVerifOTP(username, apikey, otp);

            if (!data || data.error || !data.status) {
                return res.status(400).json({
                    status: false,
                    message: `Gagal verifikasi OTP. Detail: ${data.message || 'Tidak diketahui'}`,
                    data
                });
            }

            const result = data.result || {};

            // ✅ Simpan token ke global (opsional, kalau mau caching)
            global.tokenorkut = result.token;
            console.log('[VERIFOTP SCRAPE] Token Disimpan:', global.tokenorkut);

            res.status(200).json({
                status: true,
                message: 'Verifikasi OTP berhasil!',
                detail: {
                    nama_toko: result.name,
                    username: result.username,
                    saldo: result.balance,
                    token: result.token
                },
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
