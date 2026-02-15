const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
// Render'ın verdiği PORT değerini kullan (önemli!)
const PORT = process.env.PORT || 3000;

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public klasörünü statik olarak sun
app.use(express.static(path.join(__dirname, 'public')));

// ANA SAYFA - Health check için çok önemli!
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HEALTH CHECK - Render'ın istediği route (çok önemli!)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Sipariş alma endpoint'i
app.post('/siparis', (req, res) => {
    const yeniSiparis = req.body;
    
    // Siparişe tarih ve ID ekle
    yeniSiparis.tarih = new Date().toLocaleString('tr-TR');
    yeniSiparis.id = Date.now().toString();

    // orders.json dosyasının tam yolu
    const ordersPath = path.join(__dirname, 'orders.json');

    fs.readFile(ordersPath, 'utf8', (err, data) => {
        let siparisler = [];
        
        if (!err && data) {
            try {
                siparisler = JSON.parse(data);
            } catch (e) {
                console.log('JSON parse hatası:', e);
            }
        }

        siparisler.push(yeniSiparis);

        fs.writeFile(ordersPath, JSON.stringify(siparisler, null, 2), (err) => {
            if (err) {
                console.log('Dosya yazma hatası:', err);
                res.status(500).json({ basarili: false, mesaj: 'Sipariş kaydedilemedi' });
            } else {
                res.json({ basarili: true, mesaj: 'Sipariş alındı!' });
            }
        });
    });
});

// Admin panel için siparişleri getir
app.get('/admin/siparisler', (req, res) => {
    const ordersPath = path.join(__dirname, 'orders.json');
    
    fs.readFile(ordersPath, 'utf8', (err, data) => {
        if (err) {
            console.log('Dosya okuma hatası:', err);
            res.json([]);
        } else {
            try {
                const siparisler = JSON.parse(data) || [];
                // En yeni en üstte olacak şekilde ters çevir
                res.json(siparisler.reverse());
            } catch (e) {
                console.log('JSON parse hatası:', e);
                res.json([]);
            }
        }
    });
});

// 404 hatası için
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Sunucuyu başlat - Tüm network arayüzlerinde dinle
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});