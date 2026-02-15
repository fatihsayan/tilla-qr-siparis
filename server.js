const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public klasörünü statik olarak sun
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sipariş alma
app.post('/siparis', (req, res) => {
    const yeniSiparis = req.body;
    yeniSiparis.tarih = new Date().toLocaleString('tr-TR');
    yeniSiparis.id = Date.now().toString();

    fs.readFile('orders.json', 'utf8', (err, data) => {
        let siparisler = [];
        if (!err && data) {
            try {
                siparisler = JSON.parse(data);
            } catch (e) {
                console.log('Parse hatası:', e);
            }
        }

        siparisler.push(yeniSiparis);

        fs.writeFile('orders.json', JSON.stringify(siparisler, null, 2), (err) => {
            if (err) {
                res.json({ basarili: false });
            } else {
                res.json({ basarili: true });
            }
        });
    });
});

// Siparişleri getir
app.get('/admin/siparisler', (req, res) => {
    fs.readFile('orders.json', 'utf8', (err, data) => {
        if (err) {
            res.json([]);
        } else {
            try {
                const siparisler = JSON.parse(data) || [];
                res.json(siparisler.reverse());
            } catch (e) {
                res.json([]);
            }
        }
    });
});

// Health check - Render için gerekli
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 404 handler - basit versiyon
app.use((req, res) => {
    res.status(404).send('Sayfa bulunamadı');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
});