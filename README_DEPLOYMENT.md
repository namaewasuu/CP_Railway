# 🚀 Railway Deployment Rehberi

Bu projeyi Railway üzerinden deploy etmek için adım adım rehber.

## 📋 Ön Gereksinimler

1. **GitHub hesabı** (projeyi GitHub'a push etmeniz gerekiyor)
2. **Railway hesabı** (https://railway.app - GitHub ile giriş yapabilirsiniz)
3. **MySQL database** (Railway'de otomatik oluşturulacak)

## 🔧 Adım 1: Projeyi GitHub'a Push Edin

```bash
# Proje klasöründe
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

## 🚂 Adım 2: Railway'de Yeni Proje Oluşturun

1. https://railway.app adresine gidin
2. "New Project" butonuna tıklayın
3. "Deploy from GitHub repo" seçeneğini seçin
4. GitHub repository'nizi seçin

## 🗄️ Adım 3: MySQL Database Ekleyin

1. Railway dashboard'da projenize gidin
2. "+ New" butonuna tıklayın
3. "Database" → "Add MySQL" seçin
4. MySQL servisi otomatik olarak oluşturulacak

## ⚙️ Adım 4: Environment Variables Ayarlayın

Railway'de projenize gidin → "Variables" sekmesi:

### Otomatik Oluşanlar (MySQL eklendikten sonra):
- `MYSQL_URL` veya `DATABASE_URL` - MySQL bağlantı string'i (otomatik oluşur)

### Manuel Eklenmesi Gerekenler:
- `PORT` = `5001` (veya Railway'in otomatik atadığı port)
- Frontend için: `VITE_BACKEND_URL` = Railway'in verdiği backend URL'i
- Frontend için: `VITE_GOOGLE_MAPS_API_KEY` = Google Maps API key'iniz

## 🔄 Adım 5: Deployment Ayarları

Railway otomatik olarak:
- `requirements.txt` dosyasını bulur
- Python dependencies'leri yükler
- `railway.json` dosyasındaki komutları çalıştırır

**Not:** Railway, `PORT` environment variable'ını otomatik olarak ayarlar. Backend'inizde bunu kullanın:

```python
import os
port = int(os.getenv('PORT', 5001))
app.run(host="0.0.0.0", port=port)
```

## 📝 Adım 6: Database Migration

İlk deployment'tan sonra database tablolarını oluşturmak için:

1. Railway dashboard'da projenize gidin
2. "Deployments" → En son deployment'a tıklayın
3. "View Logs" → Database bağlantısını kontrol edin

Veya local'de test etmek için:
```bash
cd backend
python database.py  # Tabloları oluşturur
```

## 🌐 Adım 7: Frontend Deployment

Frontend'i ayrı bir Railway servisi olarak deploy edebilirsiniz:

1. Railway'de "+ New" → "GitHub Repo" seçin
2. Aynı repository'yi seçin
3. Root directory: `frontend` olarak ayarlayın
4. Build command: `npm install && npm run build`
5. Start command: `npm run preview` (veya Vite için uygun komut)

## ✅ Kontrol Listesi

- [ ] GitHub'a push edildi
- [ ] Railway'de proje oluşturuldu
- [ ] MySQL database eklendi
- [ ] Environment variables ayarlandı
- [ ] Backend deploy edildi
- [ ] Database tabloları oluşturuldu
- [ ] Frontend deploy edildi (opsiyonel)
- [ ] Test edildi

## 🐛 Sorun Giderme

### Database bağlantı hatası:
- `DATABASE_URL` veya `MYSQL_URL` environment variable'ının doğru olduğundan emin olun
- Railway'de MySQL servisinin çalıştığından emin olun

### Port hatası:
- Railway otomatik olarak `PORT` environment variable'ını ayarlar
- Backend'inizde `os.getenv('PORT', 5001)` kullanın

### Build hatası:
- `requirements.txt` dosyasının doğru olduğundan emin olun
- Railway logs'u kontrol edin

## 📚 Ek Kaynaklar

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

