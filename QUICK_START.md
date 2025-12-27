# 🚀 Hızlı Başlangıç - GitHub & Railway Deployment

## 📋 Yapılacaklar Listesi

### 1. GitHub'a Push ✅

```bash
cd /Users/asu/Downloads/asu_proje
git init
git add .
git commit -m "Initial commit: İstanbul Trafik Tahmin Sistemi"
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

Detaylı talimatlar için: `GITHUB_SETUP.md`

### 2. Railway'de Deploy 🚂

1. [railway.app](https://railway.app) → GitHub ile giriş yap
2. **New Project** → **Deploy from GitHub repo** → Repository'ni seç

#### Backend Servisi:
- **+ New** → **GitHub Repo** → Aynı repo
- **Settings** → **Root Directory**: `backend`
- **Variables** → Eklenmesi gerekenler:
  - `PORT=5001` (Railway otomatik ekler)
  - MySQL için `MYSQL_URL` otomatik eklenir

#### MySQL Database:
- **+ New** → **Database** → **Add MySQL**
- `MYSQL_URL` otomatik olarak backend'e eklenir

#### Frontend Servisi:
- **+ New** → **GitHub Repo** → Aynı repo
- **Settings** → **Root Directory**: `frontend`
- **Settings** → **Build Command**: `npm install && npm run build`
- **Settings** → **Start Command**: `npm run serve`
- **Variables** → Eklenmesi gerekenler:
  - `VITE_BACKEND_URL=https://backend-servis-url.railway.app`
  - `VITE_GOOGLE_MAPS_API_KEY=your_api_key`

### 3. Domain Ayarlama 🌐

Her servis için:
- **Settings** → **Generate Domain** → Ücretsiz domain al
- Frontend domain'ini kullanıcılarla paylaş

Detaylı talimatlar için: `DEPLOYMENT.md`

## ⚠️ Önemli Notlar

1. **Google Maps API Key**: [Google Cloud Console](https://console.cloud.google.com) → API Key oluştur
2. **Environment Variables**: `.env` dosyalarını asla commit etme (`.gitignore`'da)
3. **Database**: İlk deploy'da tablolar otomatik oluşur
4. **CORS**: Backend'de tüm origin'lere izin verilmiş (production'da sınırlandır)

## 🔗 Yararlı Dosyalar

- `README.md` - Proje açıklaması ve genel bilgiler
- `DEPLOYMENT.md` - Detaylı Railway deployment rehberi
- `GITHUB_SETUP.md` - GitHub'a push rehberi
- `.gitignore` - Git'te ignore edilecek dosyalar

## ✅ Kontrol Listesi

- [ ] GitHub repository oluşturuldu
- [ ] Kodlar GitHub'a push edildi
- [ ] Railway hesabı oluşturuldu
- [ ] Backend servisi deploy edildi
- [ ] MySQL database eklendi
- [ ] Frontend servisi deploy edildi
- [ ] Environment variables ayarlandı
- [ ] Domain'ler oluşturuldu
- [ ] Google Maps API key eklendi
- [ ] Test edildi ve çalışıyor ✅

## 🆘 Sorun mu var?

- `DEPLOYMENT.md` dosyasındaki **Troubleshooting** bölümüne bakın
- Railway **Logs** sekmesinden hata mesajlarını kontrol edin
- Backend ve Frontend servislerinin çalıştığından emin olun

