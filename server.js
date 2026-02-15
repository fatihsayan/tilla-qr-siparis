const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); 

// Sipariş alma endpoint'i
app.post("/siparis", (req, res) => {
    const yeniSiparis = req.body;
    
    yeniSiparis.tarih = new Date().toLocaleString('tr-TR');
    yeniSiparis.id = Date.now().toString();

    fs.readFile("orders.json", (err, data) => {
        let siparisler = [];
        if (!err && data.length > 0) {
            try {
                siparisler = JSON.parse(data);
            } catch (e) {
                siparisler = [];
            }
        }

        siparisler.push(yeniSiparis);

        fs.writeFile("orders.json", JSON.stringify(siparisler, null, 2), (err) => {
            if (err) {
                res.json({ basarili: false, mesaj: "Sipariş kaydedilemedi" });
            } else {
                res.json({ basarili: true, mesaj: "Sipariş alındı!" });
            }
        });
    });
});

// Admin panel için siparişleri getir
app.get("/admin/siparisler", (req, res) => {
    fs.readFile("orders.json", (err, data) => {
        if (err) {
            res.json([]);
        } else {
            try {
                const siparisler = JSON.parse(data);
                siparisler.reverse();
                res.json(siparisler);
            } catch (e) {
                res.json([]);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});