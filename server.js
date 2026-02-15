const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/siparis", (req, res) => {
    const yeniSiparis = req.body;

    fs.readFile("orders.json", (err, data) => {
        let siparisler = [];
        if (!err && data.length > 0) {
            siparisler = JSON.parse(data);
        }

        siparisler.push(yeniSiparis);

        fs.writeFile("orders.json", JSON.stringify(siparisler, null, 2), () => {
            res.json({ mesaj: "Sipariş alındı!" });
        });
    });
});
app.use(express.static("public"));

app.listen(3000, () => {
    console.log("Sunucu çalışıyor: http://localhost:3000");
});
