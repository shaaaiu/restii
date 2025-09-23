const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { URLSearchParams } = require("url");

const app = express();

// === CLASS OrderKuota ===
class OrderKuota {
  static API_URL = 'https://app.orderkuota.com/api/v2';
  static API_URL_ORDER = 'https://app.orderkuota.com/api/v2/order';
  static HOST = 'app.orderkuota.com';
  static USER_AGENT = 'okhttp/4.12.0';
  static APP_VERSION_NAME = '25.08.11';
  static APP_VERSION_CODE = '250811';
  static APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';
  static PHONE_MODEL = 'SM-G960N';
  static PHONE_UUID = 'di309HvATsaiCppl5eDpoc';
  static PHONE_ANDROID_VERSION = '9';

  constructor(username = null, authToken = null) {
    this.username = username;
    this.authToken = authToken;
  }

  async request(method, url, body = null) {
    try {
      const res = await axios({
        method,
        url,
        headers: {
          'Host': OrderKuota.HOST,
          'User-Agent': OrderKuota.USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: body ? body.toString() : null,
        timeout: 15000
      });
      return res.data;
    } catch (err) {
      return { error: err.message };
    }
  }

  async loginRequest(username, password) {
    const payload = new URLSearchParams({
      username,
      password,
      request_time: Date.now(),
      app_reg_id: OrderKuota.APP_REG_ID,
      phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      phone_uuid: OrderKuota.PHONE_UUID,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
  }

  async getAuthToken(username, otp) {
    const payload = new URLSearchParams({
      username,
      password: otp,
      request_time: Date.now(),
      app_reg_id: OrderKuota.APP_REG_ID,
      phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      phone_uuid: OrderKuota.PHONE_UUID,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/login`, payload);
  }

  async getTransactionQris(type = '', userId = null) {
    if (!userId && this.authToken) {
      userId = this.authToken.split(':')[0];
    }
    const payload = new URLSearchParams({
      request_time: Date.now(),
      app_reg_id: OrderKuota.APP_REG_ID,
      phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      phone_uuid: OrderKuota.PHONE_UUID,
      auth_username: this.username,
      auth_token: this.authToken,
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][jenis]': type,
      'requests[qris_history][page]': '1',
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      'requests[qris_history][keterangan]': '',
      'requests[0]': 'account',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      ui_mode: 'light',
      phone_model: OrderKuota.PHONE_MODEL,
    });
    const endpoint = userId ?
      `${OrderKuota.API_URL}/qris/mutasi/${userId}` :
      `${OrderKuota.API_URL}/get`;
    return await this.request('POST', endpoint, payload);
  }

  async generateQr(amount = '') {
    const payload = new URLSearchParams({
      request_time: Date.now(),
      app_reg_id: OrderKuota.APP_REG_ID,
      phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      phone_uuid: OrderKuota.PHONE_UUID,
      auth_username: this.username,
      auth_token: this.authToken,
      'requests[qris_merchant_terms][jumlah]': amount,
      'requests[0]': 'qris_merchant_terms',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      ui_mode: 'light',
      phone_model: OrderKuota.PHONE_MODEL,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }

  async withdrawalQris(amount = '') {
    const payload = new URLSearchParams({
      request_time: Date.now(),
      app_reg_id: OrderKuota.APP_REG_ID,
      phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      phone_uuid: OrderKuota.PHONE_UUID,
      auth_username: this.username,
      auth_token: this.authToken,
      'requests[qris_withdraw][amount]': amount,
      'requests[0]': 'account',
      app_version_name: OrderKuota.APP_VERSION_NAME,
      ui_mode: 'light',
      phone_model: OrderKuota.PHONE_MODEL,
    });
    return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
  }
}

// === UTIL ===
function convertCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ("000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
}
function generateTransactionId() {
  return `JARROFFC-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}
function generateExpirationTime() {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 30);
  return expirationTime;
}

// === ROUTES ===
app.get("/orderkuota/getotp", async (req, res) => {
  const { apikey, username, password } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !password) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing username/password" });

  try {
    const ok = new OrderKuota();
    const login = await ok.loginRequest(username, password);

    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: {
        otp: login?.otp || "unknown",
        otp_value: login?.otp_value || "-"
      }
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

app.get("/orderkuota/gettoken", async (req, res) => {
  const { apikey, username, otp } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !otp) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing username/otp" });

  try {
    const ok = new OrderKuota();
    const login = await ok.getAuthToken(username, otp);
    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: login
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

app.get("/orderkuota/mutasiqr", async (req, res) => {
  const { apikey, username, token } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !token) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing username/token" });

  try {
    const ok = new OrderKuota(username, token);
    let login = await ok.getTransactionQris();
    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: login.qris_history?.results || login
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

app.get("/orderkuota/profile", async (req, res) => {
  const { apikey, username, token } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !token) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing username/token" });

  try {
    const ok = new OrderKuota(username, token);
    let login = await ok.getTransactionQris();
    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: login.account || login
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

app.get("/orderkuota/createpayment", async (req, res) => {
  const { apikey, username, token, amount } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !token || !amount) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing parameter" });

  try {
    const ok = new OrderKuota(username, token);
    const qrcodeResp = await ok.generateQr(amount);
    const qrisData = qrcodeResp?.qris_merchant_terms?.results?.qris_data;
    if (!qrisData) return res.status(400).json({ creator: "Jarr Officiall", status: false, error: "QRIS generation failed", raw: qrcodeResp });

    let qrisString = qrisData.slice(0, -4).replace("010211", "010212");
    const final = qrisString + convertCRC16(qrisString);

    const buffer = await QRCode.toBuffer(final);
    const base64 = buffer.toString("base64");

    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: {
        idtransaksi: generateTransactionId(),
        jumlah: amount,
        expired: generateExpirationTime(),
        imageqris: `data:image/png;base64,${base64}`
      }
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

app.get("/orderkuota/wdqr", async (req, res) => {
  const { apikey, username, token, amount } = req.query;
  if (!global.apikeyp.includes(apikey)) return res.json({ creator: "Jarr Officiall", status: false, error: "Apikey invalid" });
  if (!username || !token || !amount) return res.json({ creator: "Jarr Officiall", status: false, error: "Missing parameter" });

  try {
    const ok = new OrderKuota(username, token);
    const wd = await ok.withdrawalQris(amount);
    res.json({
      creator: "Jarr Officiall",
      status: true,
      result: wd
    });
  } catch (err) {
    res.status(500).json({ creator: "Jarr Officiall", status: false, error: err.message });
  }
});

module.exports = app;