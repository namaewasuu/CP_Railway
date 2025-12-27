# 🚀 Render.com Deployment Rehberi (Railway MySQL ile)

Bu rehber, backend ve frontend'i Render'da, MySQL database'i Railway'de deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

1. ✅ GitHub Repository: Projeniz GitHub'da (`namaewasuu/CP_Railway`)
2. Railway Hesabı: MySQL database için
3. Render Hesabı: Backend ve Frontend için
4. Google Maps API Key: Google Cloud Console'dan

---

## 🗄️ ADIM 1: Railway'de MySQL Database Oluşturma

### 1.1 Railway'de Database Oluştur

1. [railway.app](https://railway.app) → Giriş yapın
2. **New Project** → **Deploy New** → **Database** → **Add MySQL**
3. MySQL servisi oluşturulacak
4. **Variables** sekmesine gidin
5. `MYSQL_URL` veya `DATABASE_URL` değişkenini kopyalayın

**Örnek format:**
```
mysql://user:password@host:port/database
```

### 1.2 Database URL'i Not Edin

Bu URL'i Render backend'de kullanacağız. Format şöyle olabilir:
```
mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
```

**ÖNEMLİ**: URL'i `mysql+pymysql://` formatına çevirmemiz gerekebilir. Render'da environment variable olarak eklerken düzeltiriz.

---

## 🔧 ADIM 2: Render'da Backend Servisi Oluşturma

### 2.1 Render Hesabı Oluştur

1. [render.com](https://render.com) → **Get Started for Free**
2. **Sign up with GitHub** → GitHub hesabınızla giriş yapın

### 2.2 Backend Web Service Oluştur

1. Render dashboard'da **New +** → **Web Service**
2. **Connect account** → GitHub hesabınızı bağlayın
3. Repository'yi seçin: `namaewasuu/CP_Railway`
4. Ayarları yapın:

#### Temel Ayarlar:
- **Name**: `cp-railway-backend` (veya istediğiniz isim)
- **Region**: `Frankfurt` (veya size yakın)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  python app.py
  ```

#### Environment Variables:

**Variables** sekmesine gidin ve şunları ekleyin:

| Key | Value | Açıklama |
|-----|-------|----------|
| `DATABASE_URL` | `mysql+pymysql://user:password@host:port/database` | Railway MySQL URL'i (mysql+pymysql:// ile başlamalı) |
| `PORT` | `5001` | Port (Render otomatik PORT ekler, ama yine de ekleyin) |

**ÖNEMLİ**: Railway'den aldığınız `MYSQL_URL` şöyle olabilir:
```
mysql://root:xxx@containers-us-west-xxx.railway.app:3306/railway
```

Bunu şu formata çevirin:
```
mysql+pymysql://root:xxx@containers-us-west-xxx.railway.app:3306/railway
```

Yani `mysql://` yerine `mysql+pymysql://` yazın.

### 2.3 Deploy

1. **Create Web Service** butonuna tıklayın
2. Render otomatik olarak build ve deploy başlatacak
3. **Logs** sekmesinden ilerlemeyi takip edin
4. Deploy tamamlandığında URL alacaksınız: `https://cp-railway-backend.onrender.com`

**Not**: İlk deploy 5-10 dakika sürebilir.

---

## 🎨 ADIM 3: Render'da Frontend Static Site Oluşturma

### 3.1 Frontend Static Site Oluştur

1. Render dashboard'da **New +** → **Static Site**
2. Repository'yi seçin: `namaewasuu/CP_Railway`
3. Ayarları yapın:

#### Temel Ayarlar:
- **Name**: `cp-railway-frontend` (veya istediğiniz isim)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `dist`

#### Environment Variables:

**Environment Variables** sekmesine gidin ve şunları ekleyin:

| Key | Value | Açıklama |
|-----|-------|----------|
| `VITE_BACKEND_URL` | `https://cp-railway-backend.onrender.com` | Backend servisinizin Render URL'i |
| `VITE_GOOGLE_MAPS_API_KEY` | `your_google_maps_api_key` | Google Maps API key'iniz |

**ÖNEMLİ**: `VITE_BACKEND_URL` için backend servisinizin Render URL'ini kullanın (yukarıdaki adımda aldığınız URL).

### 3.2 Deploy

1. **Create Static Site** butonuna tıklayın
2. Render otomatik olarak build ve deploy başlatacak
3. Deploy tamamlandığında URL alacaksınız: `https://cp-railway-frontend.onrender.com`

---

## ✅ ADIM 4: Test ve Kontrol

### 4.1 Backend Kontrolü

1. Backend URL'inize gidin: `https://cp-railway-backend.onrender.com/health`
2. `{"status":"ok"}` dönmeli

### 4.2 Frontend Kontrolü

1. Frontend URL'inize gidin: `https://cp-railway-frontend.onrender.com`
2. Uygulama açılmalı
3. Kayıt ol / Giriş yap test edin
4. Arama yapıp test edin

### 4.3 Database Kontrolü

1. Railway dashboard → MySQL servisi → **Connect** → **MySQL Client**
2. Veya terminal'den:
   ```bash
   mysql -h host -u user -p database
   ```
3. Tabloların oluştuğunu kontrol edin:
   ```sql
   SHOW TABLES;
   ```

---

## 🔧 Troubleshooting

### Backend Başlamıyor

- **Logs** sekmesinde hata mesajlarını kontrol edin
- `DATABASE_URL` formatının doğru olduğundan emin olun (`mysql+pymysql://` ile başlamalı)
- Railway MySQL servisinin çalıştığından emin olun

### Database Connection Hatası

- Railway'deki `MYSQL_URL`'i `mysql+pymysql://` formatına çevirdiğinizden emin olun
- Railway MySQL servisinin **Public** olduğundan emin olun (Settings → Networking)
- Firewall ayarlarını kontrol edin

### Frontend Build Hatası

- **Logs** sekmesinde build hatalarını kontrol edin
- `VITE_BACKEND_URL` ve `VITE_GOOGLE_MAPS_API_KEY` environment variable'larının ayarlandığından emin olun
- Node.js versiyonunun uyumlu olduğundan emin olun

### CORS Hatası

- Backend'de CORS ayarları zaten tüm origin'lere izin veriyor
- Frontend URL'inin backend tarafından kabul edildiğinden emin olun

---

## 📝 Önemli Notlar

1. **Render Free Plan**: 
   - Servisler 15 dakika kullanılmazsa "sleep" moduna geçer
   - İlk istek 30-60 saniye sürebilir (cold start)
   - Aylık 750 saat ücretsiz

2. **Railway MySQL**:
   - Railway'de sadece database deploy edebiliyorsunuz (sınırlı plan)
   - MySQL servisi çalışmaya devam eder
   - Database URL'i güvende tutun

3. **Environment Variables**:
   - Hassas bilgileri environment variable olarak saklayın
   - `.env` dosyalarını asla commit etmeyin

4. **Custom Domain**:
   - Render'da ücretsiz custom domain ekleyebilirsiniz
   - Settings → Custom Domain

---

## 🎉 Başarılı!

Artık projeniz canlıda! 

- **Frontend**: `https://cp-railway-frontend.onrender.com`
- **Backend**: `https://cp-railway-backend.onrender.com`
- **Database**: Railway MySQL

Sorunuz olursa haber verin!

