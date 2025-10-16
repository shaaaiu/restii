
module.exports = function (app) {
    const EXTERNAL_API_KEY = "RyuuXiao"; 
    const EXTERNAL_OTP_API_BASE = "https://api.xiaoprivate.biz.id/orderkuota/getotp";
    app.get('/api/getotp', async (req, res) => {
        
        // 1. Ambil kredensial yang dibutuhkan dari query parameters
        const { username, password } = req.query;

        // 2. Lakukan validasi dasar: Pastikan username dan password ada
        if (!username || !password) {
            return res.status(400).json({
                status: false,
                message: "Permintaan tidak lengkap. Mohon sertakan 'username' dan 'password' sebagai query parameters di URL."
            });
        }

        // 3. Buat URL lengkap dengan API Key yang sudah pasti (RyuuXiao) 
        //    dan kredensial dinamis (username, password)
        const fullApiUrl = `${EXTERNAL_OTP_API_BASE}?apikey=${EXTERNAL_API_KEY}&username=${username}&password=${password}`;

        console.log(`[API] Mencoba mengambil data OTP untuk username: ${username}`);
        
        try {
            // 4. Panggil API eksternal menggunakan fungsi fetch()
            const response = await fetch(fullApiUrl);

            // 5. Periksa jika ada masalah koneksi atau status non-OK
            if (!response.ok) {
                const errorText = await response.text(); 
                
                return res.status(response.status).json({
                    status: false,
                    message: `Gagal mengakses API eksternal: Status ${response.status}`,
                    external_error_info: errorText
                });
            }

            // 6. Parse respons dari API eksternal sebagai JSON
            const apiData = await response.json();

            // 7. Kirimkan data hasil dari API eksternal kembali ke klien
            res.status(200).json({
                status: true,
                message: "Data OTP berhasil diambil dari layanan eksternal.",
                data_from_external_api: apiData
            });

        } catch (error) {
            // Tangani error yang terjadi selama proses fetch (misalnya, masalah jaringan)
            console.error("Kesalahan saat memanggil API eksternal:", error.message);
            res.status(500).json({
                status: false,
                message: "Gagal memproses permintaan (Internal Server Error).",
                error_details: error.message
            });
        }
    });
}
