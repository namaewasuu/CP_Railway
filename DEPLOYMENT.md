# 🚂 Railway Deployment Rehberi

Bu rehber, projeyi Railway.app üzerinde deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

1. **GitHub Repository**: Projenizi GitHub'a push edin
2. **Railway Hesabı**: [railway.app](https://railway.app) üzerinde hesap oluşturun
3. **Google Maps API Key**: Google Cloud Console'dan API key alın

## 🚀 Deployment Adımları

### 1. Railway'de Yeni Proje Oluşturma

1. Railway dashboard'a giriş yapın
2. **"New Project"** butonuna tıklayın
3. **"Deploy from GitHub repo"** seçeneğini seçin
4. GitHub repository'nizi seçin ve bağlayın

### 2. İki Servis Oluşturma

Railway'de iki ayrı servis oluşturacağız:
- **Backend Service** (Flask API)
- **Frontend Service** (React App)

#### Backend Servisi

1. Railway projenizde **"+ New"** butonuna tıklayın
2. **"GitHub Repo"** seçin ve aynı repository'yi seçin
3. Servis adını **"backend"** olarak ayarlayın
4. **Settings** > **Root Directory** → `backend` olarak ayarlayın
5. **Settings** > **Start Command** → `python app.py` olarak ayarlayın

#### Frontend Servisi

1. Yine **"+ New"** butonuna tıklayın
2. **"GitHub Repo"** seçin ve aynı repository'yi seçin
3. Servis adını **"frontend"** olarak ayarlayın
4. **Settings** > **Root Directory** → `frontend` olarak ayarlayın
5. **Settings** > **Build Command** → `npm install && npm run build` olarak ayarlayın
6. **Settings** > **Start Command** → `npx serve -s dist -l 3000` olarak ayarlayın

**Not**: `serve` paketini kullanmak için `frontend/package.json`'a ekleyin:
```json
"scripts": {
  "serve": "serve -s dist -l 3000"
}
```

Veya Railway'in otomatik static file serving özelliğini kullanabilirsiniz.

### 3. MySQL Veritabanı Ekleme

1. Railway projenizde **"+ New"** butonuna tıklayın
2. **"Database"** > **"Add MySQL"** seçin
3. Railway otomatik olarak `MYSQL_URL` environment variable'ını ekleyecek

### 4. Environment Variables Ayarlama

Her servis için gerekli environment variable'ları ekleyin:

#### Backend Servisi Variables

Railway dashboard'da backend servisine gidin, **Variables** sekmesine tıklayın:

```
DATABASE_URL=<Railway otomatik olarak MYSQL_URL ekler, bu yeterli>
PORT=5001
```

**Not**: `database.py` dosyası zaten `MYSQL_URL` veya `DATABASE_URL`'i otomatik olarak kullanır.

#### Frontend Servisi Variables

Railway dashboard'da frontend servisine gidin, **Variables** sekmesine tıklayın:

```
VITE_BACKEND_URL=https://your-backend-service.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Önemli**: `VITE_BACKEND_URL` için backend servisinizin Railway domain'ini kullanın. Backend servisinin **Settings** > **Generate Domain** ile domain oluşturun.

### 5. Build ve Deploy

Railway otomatik olarak:
- Repository'ye push yaptığınızda build başlatır
- Build başarılı olursa deploy eder
- Her servis ayrı ayrı build edilir

### 6. Domain Ayarlama

#### Backend Domain

1. Backend servisine gidin
2. **Settings** > **Generate Domain** ile ücretsiz domain alın
3. Bu domain'i frontend'in `VITE_BACKEND_URL` variable'ında kullanın

#### Frontend Domain

1. Frontend servisine gidin
2. **Settings** > **Generate Domain** ile ücretsiz domain alın
3. Bu domain'i kullanıcılarınızla paylaşın

### 7. Veritabanı Tablolarını Oluşturma

Backend ilk çalıştığında `init_db()` fonksiyonu otomatik olarak tabloları oluşturur. Eğer oluşturmazsa:

1. Backend servisinin **Logs** sekmesine gidin
2. Hata mesajlarını kontrol edin
3. Gerekirse manuel olarak MySQL'e bağlanıp tabloları oluşturun

## 🔧 Troubleshooting

### Backend Başlamıyor

- **Logs** sekmesinde hata mesajlarını kontrol edin
- `DATABASE_URL` veya `MYSQL_URL` environment variable'ının doğru olduğundan emin olun
- MySQL servisinin çalıştığından emin olun

### Frontend Build Hatası

- **Logs** sekmesinde build hatalarını kontrol edin
- `VITE_BACKEND_URL` ve `VITE_GOOGLE_MAPS_API_KEY` environment variable'larının ayarlandığından emin olun
- Node.js versiyonunun uyumlu olduğundan emin olun

### CORS Hatası

- Backend'de CORS ayarlarının tüm origin'lere izin verdiğinden emin olun
- Frontend URL'inin backend tarafından kabul edildiğinden emin olun

### Database Connection Hatası

- `MYSQL_URL` formatının doğru olduğundan emin olun: `mysql+pymysql://user:password@host:port/database`
- Railway MySQL servisinin çalıştığından emin olun
- Database'in oluşturulduğundan emin olun

## 📝 Notlar

- Railway ücretsiz planında aylık $5 kredi verir
- MySQL servisi de kredi kullanır
- Production'da environment variable'ları güvende tutun
- Regular backup almayı unutmayın

## 🔗 Yararlı Linkler

- [Railway Documentation](https://docs.railway.app)
- [Railway Pricing](https://railway.app/pricing)
- [Google Maps API](https://developers.google.com/maps/documentation)

