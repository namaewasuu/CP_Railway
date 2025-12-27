# 🧪 Local Test Rehberi

## ✅ Hazırlık Tamamlandı!

Database tabloları başarıyla oluşturuldu. Şimdi test edebilirsiniz.

## 🚀 Backend'i Çalıştırma

**Terminal 1:**
```bash
cd /Users/asu/Downloads/asu_proje/backend
source venv/bin/activate
python3 app.py
```

Backend `http://localhost:5001` adresinde çalışacak.

## 🎨 Frontend'i Çalıştırma

**Terminal 2:**
```bash
cd /Users/asu/Downloads/asu_proje/frontend
npm run dev
```

Frontend genellikle `http://localhost:5173` adresinde çalışır.

## 📋 Test Senaryoları

### 1. Health Check
```bash
curl http://localhost:5001/health
```

### 2. Predict Test
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "datetime": "2025-12-20T08:30",
    "start_lat": 41.0082,
    "start_lon": 28.9784,
    "end_lat": 41.0421,
    "end_lon": 29.2510
  }'
```

### 3. History Test
```bash
# Önce bir arama yapın (yukarıdaki predict ile)
# Sonra history'yi kontrol edin:
curl "http://localhost:5001/history?user_id=1"
```

### 4. Favorites Test
```bash
# Favori ekle:
curl -X POST http://localhost:5001/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "origin": "Başakşehir, İstanbul",
    "destination": "Beykoz, İstanbul",
    "origin_lat": 41.0082,
    "origin_lon": 28.9784,
    "destination_lat": 41.0421,
    "destination_lon": 29.2510
  }'

# Favorileri listele:
curl "http://localhost:5001/favorites?user_id=1"
```

## 🗄️ Database Kontrolü

Database'deki tabloları görmek için:
```bash
mysql -u root -e "USE traffic_db; SHOW TABLES;"
```

Verileri görmek için:
```bash
mysql -u root -e "USE traffic_db; SELECT * FROM search_history LIMIT 5;"
mysql -u root -e "USE traffic_db; SELECT * FROM favorites LIMIT 5;"
```

## ⚠️ Notlar

- Frontend'de login yaparken herhangi bir email/şifre ile giriş yapabilirsiniz (demo mod)
- User ID, email'den hash ile oluşturuluyor (aynı email = aynı ID)
- Backend çalışırken database bağlantısı otomatik olarak yapılır
- `.env` dosyasında MySQL şifreniz varsa, `DATABASE_URL`'de belirtmeyi unutmayın

## 🐛 Sorun Giderme

### Database bağlantı hatası:
- MySQL'in çalıştığından emin olun: `brew services list | grep mysql`
- `.env` dosyasındaki `DATABASE_URL`'i kontrol edin
- MySQL şifreniz varsa URL'e ekleyin: `mysql+pymysql://root:şifre@localhost:3306/traffic_db`

### Port hatası:
- Backend port 5001'i kullanıyor, başka bir uygulama kullanıyorsa değiştirin
- Frontend port'u genellikle 5173, farklı olabilir


