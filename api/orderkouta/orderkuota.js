const express = require("express")
const axios = require("axios")
const app = express()
const port = 3000

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
    const response = await axios.get(apiUrl)
    const result = response.data

    res.status(200).json({
      status: true,
      result: result,
    })
  } catch (error) {
    res.status(500).json({ status: false, error: error.message })
  }
})

// contoh endpoint lain (scrape hasil OTP email)
app.get("/orderkuota/otp", async (req, res) => {
  const { username, password, apikey } = req.query

  if (!apikey || !global.apikeyp.includes(apikey)) {
    return res.json({ status: false, error: "Invalid or missing API key" })
  }
  if (!username || !password) {
    return res.json({ status: false, error: "Username & password required" })
  }

  try {
    const apiUrl = `https://anabot.my.id/api/tools/orderKuota/login?username=${username}&password=${password}&apikey=${apikey}`
    const response = await axios.get(apiUrl)
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

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`)
})
