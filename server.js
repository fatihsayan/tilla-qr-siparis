const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Sipariş kaydet
app.post('/siparis', (req, res) => {
    const siparis = req.body;
    siparis.tarih = new Date().toLocaleString('tr-TR');
    
    let siparisler = [];
    try {
        if (fs.existsSync('orders.json')) {
            siparisler = JSON.parse(fs.readFileSync('orders.json'));
        }
    } catch (e) {}
    
    siparisler.push(siparis);
    fs.writeFileSync('orders.json', JSON.stringify(siparisler, null, 2));
    res.json({ basarili: true });
});

// Siparişleri getir
app.get('/siparisler', (req, res) => {
    try {
        if (fs.existsSync('orders.json')) {
            const siparisler = JSON.parse(fs.readFileSync('orders.json'));
            res.json(siparisler);
        } else {
            res.json([]);
        }
    } catch (e) {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});