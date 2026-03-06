process.env.TZ = 'Europe/Istanbul';

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
    console.log('Gelen sipariş:', siparis);
    
    siparis.tarih = new Date().toISOString();
    
    let siparisler = [];
    try {
        if (fs.existsSync('orders.json')) {
            siparisler = JSON.parse(fs.readFileSync('orders.json'));
        }
    } catch (e) {}
    
    siparisler.push(siparis);
    fs.writeFileSync('orders.json', JSON.stringify(siparisler, null, 2));
    
    // Masa durumunu güncelle
    if (masaDurumlari[siparis.masa]) {
        masaDurumlari[siparis.masa].durum = 'dolu';
        masaDurumlari[siparis.masa].baslangic = new Date();
    }
    
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

// Hesap iste
app.post('/hesap-iste', (req, res) => {
    const masaNo = req.body.masa || 'Belirtilmemiş';
    const zaman = new Date().toLocaleString('tr-TR');
    
    let hesaplar = [];
    try {
        if (fs.existsSync('hesaplar.json')) {
            hesaplar = JSON.parse(fs.readFileSync('hesaplar.json'));
        }
    } catch (e) {}
    
    hesaplar.push({
        masa: masaNo,
        zaman: zaman,
        id: Date.now().toString(),
        durum: 'bekliyor'
    });
    
    fs.writeFileSync('hesaplar.json', JSON.stringify(hesaplar, null, 2));
    res.json({ basarili: true });
});

// Hesap isteklerini getir
app.get('/hesap-istekleri', (req, res) => {
    try {
        if (fs.existsSync('hesaplar.json')) {
            const hesaplar = JSON.parse(fs.readFileSync('hesaplar.json'));
            res.json(hesaplar);
        } else {
            res.json([]);
        }
    } catch (e) {
        res.json([]);
    }
});

// Masa durumları
let masaDurumlari = {
    1: { durum: 'bos', baslangic: null, sure: 0 },
    2: { durum: 'bos', baslangic: null, sure: 0 },
    3: { durum: 'bos', baslangic: null, sure: 0 },
    4: { durum: 'bos', baslangic: null, sure: 0 },
    5: { durum: 'bos', baslangic: null, sure: 0 },
    6: { durum: 'bos', baslangic: null, sure: 0 },
    7: { durum: 'bos', baslangic: null, sure: 0 },
    8: { durum: 'bos', baslangic: null, sure: 0 },
    9: { durum: 'bos', baslangic: null, sure: 0 },
    10: { durum: 'bos', baslangic: null, sure: 0 }
};

// Masa durumlarını getir
app.get('/masa-durumlari', (req, res) => {
    const simdi = new Date();
    Object.keys(masaDurumlari).forEach(masa => {
        if (masaDurumlari[masa].durum === 'dolu' && masaDurumlari[masa].baslangic) {
            const fark = simdi - new Date(masaDurumlari[masa].baslangic);
            const dakika = Math.floor(fark / 60000);
            const saniye = Math.floor((fark % 60000) / 1000);
            masaDurumlari[masa].sure = `${dakika} dk ${saniye} sn`;
        }
    });
    res.json(masaDurumlari);
});

// Masa boşalt (SADECE DURUM, SİPARİŞLER KALIR)
app.post('/masa-sifirla', (req, res) => {
    const { masaNo } = req.body;
    
    try {
        // SADECE MASA DURUMUNU GÜNCELLE, SİPARİŞLERİ SİLME!
        if (masaDurumlari[masaNo]) {
            masaDurumlari[masaNo].durum = 'bos';
            masaDurumlari[masaNo].baslangic = null;
            masaDurumlari[masaNo].sure = 0;
        }
        
        console.log(`Masa ${masaNo} durumu sıfırlandı (siparişler korundu).`);
        res.json({ basarili: true });
    } catch (e) {
        console.error('Sıfırlama hatası:', e);
        res.json({ basarili: false, hata: e.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});