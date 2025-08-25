const express = require("express")
const axios = require("axios")
const bodyParser = require("body-parser")

// import fungsi2 QRIS kamu
const qrisRoutes = require("./qrisModule") // file yg kamu kasih tadi

const app = express()
app.use(bodyParser.json())

// simpan daftar apikey kamu
global.apikeyp = ["freeApikey"]

// ========== ENDPOINT LOGIN KE ORDERKUOTA ==========
app.get("/orderkuota/login", async (req, res) => {
  try {
    const { username, password, apikey } = req.query
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }

    const response = await axios.get(
      "https://anabot.my.id/api/tools/orderKuota/login",
      {
        params: {
          username,
          password,
          apikey,
        },
      }
    )

    res.json({
      status: true,
      result: response.data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== ENDPOINT QRIS (dari modul kamu) ==========
qrisRoutes(app)

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
