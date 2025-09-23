import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { ImageUploadService } from 'node-upload-images';

// CLASS OrderKuota
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

    async loginRequest(username, password) {
        const payload = new URLSearchParams({
            username,
            password,
            request_time: Date.now(),
            app_reg_id: OrderKuota.APP_REG_ID,
            phone_android_version: OrderKuota.PHONE_ANDROID_VERSION,
            app_version_code: OrderKuota.APP_VERSION_CODE,
            phone_uuid: OrderKuota.PHONE_UUID
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
            phone_uuid: OrderKuota.PHONE_UUID
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
            phone_model: OrderKuota.PHONE_MODEL
        });

        const endpoint = userId ? `${OrderKuota.API_URL}/qris/mutasi/${userId}` : `${OrderKuota.API_URL}/get`;
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
            phone_model: OrderKuota.PHONE_MODEL
        });

        const response = await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
        try {
            if (response.success && response.qris_merchant_terms && response.qris_merchant_terms.results) {
                return response.qris_merchant_terms.results;
            }
            return response;
        } catch (err) {
            return { error: err.message, raw: response };
        }
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
            phone_model: OrderKuota.PHONE_MODEL
        });

        return await this.request('POST', `${OrderKuota.API_URL}/get`, payload);
    }

    buildHeaders() {
        return {
            'Host': OrderKuota.HOST,
            'User-Agent': OrderKuota.USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
    }

    async request(method, url, body = null) {
        try {
            const res = await fetch(url, {
                method,
                headers: this.buildHeaders(),
                body: body ? body.toString() : null,
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                return data;
            } else {
                const data = await res.text();
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            }
        } catch (err) {
            return { error: err.message, status: false };
        }
    }
}

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

async function elxyzFile(buffer) {
    const service = new ImageUploadService('pixhost.to');
    const { directLink } = await service.uploadFromBinary(buffer, 'jarr.png');
    return directLink;
}

async function createQRIS(amount, codeqr) {
    let qrisData = codeqr;
    qrisData = qrisData.slice(0, -4);
    const step1 = qrisData.replace("010211", "010212");
    const step2 = step1.split("5802ID");
    amount = amount.toString();
    let uang = "54" + ("0" + amount.length).slice(-2) + amount;
    uang += "5802ID";
    const final = step2[0] + uang + step2[1];
    const result = final + convertCRC16(final);
    const buffer = await QRCode.toBuffer(result);
    const uploadedFile = await elxyzFile(buffer);
    return {
        idtransaksi: generateTransactionId(),
        jumlah: amount,
        expired: generateExpirationTime(),
        imageqris: { url: uploadedFile }
    };
}

// ROUTE EXPORT
export default [
    {
        name: "Get OTP (tahap 1)",
        desc: "Get OTP Orderkuota",
        category: "Orderkuota",
        path: "/orderkuota/getotp",
        async run(req, res) {
            const { apikey, username, password } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!password) return res.json({ status: false, error: 'Missing password' });
            try {
                const ok = new OrderKuota();
                const login = await ok.loginRequest(username, password);
                if (!login || !login.success) {
                    return res.status(400).json({ status: false, error: "Login request failed", raw: login });
                }
                res.json({ status: true, result: login.results });
            } catch (err) {
                res.status(500).json({ status: false, error: err.message, raw: err.toString() });
            }
        }
    },
    {
        name: "Get Token (tahap 2)",
        desc: "Get Token Orderkuota",
        category: "Orderkuota",
        path: "/orderkuota/gettoken",
        async run(req, res) {
            const { apikey, username, otp } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!otp) return res.json({ status: false, error: 'Missing otp' });
            try {
                const ok = new OrderKuota();
                const login = await ok.getAuthToken(username, otp);
                if (!login || !login.success) {
                    return res.status(400).json({ status: false, error: "OTP validation failed", raw: login });
                }
                res.json({ status: true, result: login.results });
            } catch (err) {
                res.status(500).json({ status: false, error: err.message, raw: err.toString() });
            }
        }
    },
    {
        name: "Cek Mutasi QRIS",
        desc: "Cek Mutasi Qris Orderkuota",
        category: "Orderkuota",
        path: "/orderkuota/mutasiqr",
        async run(req, res) {
            const { apikey, username, token } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!token) return res.json({ status: false, error: 'Missing token' });
            try {
                const ok = new OrderKuota(username, token);
                const login = await ok.getTransactionQris();
                if (!login || !login.success || !login.qris_history) {
                    return res.status(400).json({ status: false, error: "Failed to fetch QRIS history", raw: login });
                }
                res.json({ status: true, result: login.qris_history.results });
            } catch (err) {
                res.status(500).json({ status: false, error: err.message, raw: err.toString() });
            }
        }
    },
    {
        name: "Cek Profile",
        desc: "Cek Profile Orderkuota",
        category: "Orderkuota",
        path: "/orderkuota/profile",
        async run(req, res) {
            const { apikey, username, token } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!token) return res.json({ status: false, error: 'Missing token' });
            try {
                const ok = new OrderKuota(username, token);
                const login = await ok.getTransactionQris();
                if (!login || !login.success) {
                    return res.status(400).json({ status: false, error: "Failed to fetch profile data", raw: login });
                }
                res.json({ status: true, result: login });
            } catch (err) {
                res.status(500).json({ status: false, error: err.message, raw: err.toString() });
            }
        }
    },
    {
        name: "Create QRIS",
        desc: "Generate QR Code Payment",
        category: "Orderkuota",
        path: "/orderkuota/createpayment",
        async run(req, res) {
            const { apikey, username, token, amount } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!token) return res.json({ status: false, error: 'Missing token' });
            if (!amount) return res.json({ status: false, error: 'Missing amount' });

            try {
                const ok = new OrderKuota(username, token);
                const qrcodeResp = await ok.generateQr(amount);

                if (!qrcodeResp || !qrcodeResp.qris_data) {
                    return res.status(400).json({ status: false, error: "QRIS generation failed or no data returned", raw: qrcodeResp });
                }

                const finalResult = await createQRIS(amount, qrcodeResp.qris_data);
                res.status(200).json({
                    status: true,
                    result: finalResult
                });
            } catch (error) {
                res.status(500).json({ status: false, error: error.message, raw: error.toString() });
            }
        }
    },
    {
        name: "Withdraw QRIS",
        desc: "Tarik saldo QRIS Orderkuota",
        category: "Orderkuota",
        path: "/orderkuota/wdqr",
        async run(req, res) {
            const { apikey, username, token, amount } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
            if (!username) return res.json({ status: false, error: 'Missing username' });
            if (!token) return res.json({ status: false, error: 'Missing token' });
            if (!amount) return res.json({ status: false, error: 'Missing amount' });

            try {
                const ok = new OrderKuota(username, token);
                const wd = await ok.withdrawalQris(amount);
                if (!wd || !wd.success) {
                    return res.status(400).json({ status: false, error: "Withdrawal failed", raw: wd });
                }
                res.json({ status: true, result: wd });
            } catch (error) {
                res.status(500).json({ status: false, error: error.message, raw: error.toString() });
            }
        }
    }
];
