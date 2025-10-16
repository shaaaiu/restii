const axios = require('axios');

module.exports = function(app) {
  // scrape createpayment
  async function scrapeCreatePayment(username, apikey, token, amount) {
    const url = `https://api.xiaoprivate.biz.id/orderkuota/createpayment?apikey=RyuuXiao&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}&amount=${amount}`;
    console.log('[SCRAPE] createpayment URL:', url);
    try {
      const resp = await axios.get(url, {
        headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        timeout: 15000
      });
      return resp.data;
    } catch (err) {
      console.error('[SCRAPE] createpayment error:', err.message);
      return { status: false, message: 'Gagal koneksi ke createpayment.', error: err.message };
    }
  }
  // endpoint untuk createpayment
  app.get('/orderkuota/createpayment', async (req, res) => {
    const { apikey, username, token, amount } = req.query;
    if (!global.apikeyp || !global.apikeyp.includes(apikey)) {
      return res.status(403).json({ status: false, message: 'Apikey lokal tidak valid.' });
    }
    if (!username || !token || !amount) {
      return res.status(400).json({ status: false, message: 'Parameter username, token, dan amount wajib diisi.' });
    }
    const data = await scrapeCreatePayment(username, apikey, token, amount);
    return res.json(data);
  });
};
