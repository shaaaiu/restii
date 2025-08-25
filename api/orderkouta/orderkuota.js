const express = require("express")
const axios = require("axios")

const app = express()

// daftar apikey yang diizinkan
global.apikeyp = ["freeApikey"]

// Endpoint login orderKuota
app.get("/orderkuota/login", async (req, res) => {
  const { username, password, apikey } = req.query

  if (!apikey || !global.apikeyp.includes(apikey)) {
    return res.json({ status: false, error: "Invalid or missing API key" })
  }
  if (!username || !password) {
    return res.json({ status: false, error: "Username & password required" })
  }

  try {
    const apiUrl = `https://anabot.my.id/api/tools/orderKuota/login?username=${username}&password=${password}&apikey=${apikey}`
    const response = await axios.get(apiUrl, { timeout: 8000 })
    const result = response.data

    res.status(200).json({
      status: true,
      result: result,
    })
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
})

// Endpoint OTP
app.get("/orderkuota/createpayment", async (req, res) => {
  const { username, password, apikey } = req.query

  if (!apikey || !global.apikeyp.includes(apikey)) {
    return res.json({ status: false, error: "Invalid or missing API key" })
  }
  if (!username || !password) {
    return res.json({ status: false, error: "Username & password required" })
  }

  try {
    const apiUrl = `https://anabot.my.id/api/tools/orderKuota/login?username=${username}&password=${password}&apikey=${apikey}`
    const response = await axios.get(apiUrl, { timeout: 8000 })
    const result = response.data

    if (result?.data?.result?.results) {
      res.json({
        status: true,
        otp_type: result.data.result.results.otp,
        otp_value: result.data.result.results.otp_value,
      })
    } else {
      res.json({ status: false, error: "OTP not found in response" })
    }
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
})

// ❌ Jangan pakai app.listen()
// ✅ Vercel perlu export default app
module.exports = app
