process.env.TZ = 'Europe/Istanbul'; // Türkiye saat dilimi

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
    siparis.tarih = new Date().toISOString();
    
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

// Garson çağır
app.post('/garson-cagir', (req, res) => {
    const masaNo = req.body.masa || 'Belirtilmemiş';
    const zaman = new Date().toLocaleString('tr-TR');
    
    let cagrilar = [];
    try {
        if (fs.existsSync('cagrilar.json')) {
            cagrilar = JSON.parse(fs.readFileSync('cagrilar.json'));
        }
    } catch (e) {}
    
    cagrilar.push({
        masa: masaNo,
        zaman: zaman,
        id: Date.now().toString(),
        durum: 'bekliyor'
    });
    
    fs.writeFileSync('cagrilar.json', JSON.stringify(cagrilar, null, 2));
    res.json({ basarili: true });
});

// Garson çağrılarını getir
app.get('/garson-cagrilar', (req, res) => {
    try {
        if (fs.existsSync('cagrilar.json')) {
            const cagrilar = JSON.parse(fs.readFileSync('cagrilar.json'));
            res.json(cagrilar);
        } else {
            res.json([]);
        }
    } catch (e) {
        res.json([]);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});