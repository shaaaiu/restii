const axios = require('axios');

module.exports = function(app) {
// scrape mutasiqr
  async function scrapeMutasiQR(username, apikey, token) {
    const url = `https://api.xiaoprivate.biz.id/orderkuota/mutasiqr?apikey=${apikey}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`;
    console.log('[SCRAPE] mutasiqr URL:', url);
    try {
      const resp = await axios.get(url, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        timeout: 15000
      });
      return resp.data;
    } catch (err) {
      console.error('[SCRAPE] mutasiqr error:', err.message);
      return { status: false, message: 'Gagal koneksi ke mutasiqr.', error: err.message };
    }
  }

  // endpoint untuk mutasiqr
  app.get('/orderkuota/mutasiqr', async (req, res) => {
    const { username, apikey, token } = req.query;
    if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
      return res.status(403).json({ status: false, message: 'Apikey lokal tidak valid.' });
    }
    if (!username || !token) {
      return res.status(400).json({ status: false, message: 'Parameter username dan token wajib diisi.' });
    }
    const data = await scrapeMutasiQR(username, apikey, token);
    return res.json(data);
                                   });
};
