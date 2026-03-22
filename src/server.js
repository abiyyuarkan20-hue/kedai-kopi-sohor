require("dotenv").config(); // Baris paling atas wajib ini
const express = require("express");
const midtransClient = require("midtrans-client");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Midtrans Snap menggunakan variabel lingkungan (.env)
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

app.post("/api/checkout", async (req, res) => {
  try {
    const { items } = req.body;

    // 1. Validasi input
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Keranjang belanja kosong" });
    }

    // 2. Hitung ulang total di sisi server (Wajib agar sinkron dengan Midtrans)
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // 3. Susun parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id:
          "SOHOR-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        gross_amount: calculatedTotal,
      },
      item_details: items.map((item) => ({
        id: String(item.id),
        price: Number(item.price),
        quantity: Number(item.quantity),
        name: item.name.substring(0, 50),
      })),
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: "Pelanggan",
        last_name: "Sohor Coffee",
        email: "customer@sohorcoffee.com",
      },
    };

    // 4. Minta token dari Midtrans
    const transaction = await snap.createTransaction(parameter);

    // 5. Kirim token ke frontend
    res.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error Detail:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
