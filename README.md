# 🚗 İstanbul Trafik Yoğunluğu Tahmin Sistemi

Modern bir web uygulaması ile İstanbul'daki trafik yoğunluğunu tahmin edin. Google Maps entegrasyonu, kullanıcı kayıt sistemi, arama geçmişi ve favoriler özellikleri ile tam donanımlı bir trafik tahmin platformu.

## ✨ Özellikler

- 🗺️ **Google Maps Entegrasyonu**: Başlangıç ve varış noktalarını harita üzerinde görselleştirin
- 🤖 **ML Tabanlı Tahmin**: Makine öğrenmesi modeli ile trafik yoğunluğu tahmini
- 👤 **Kullanıcı Sistemi**: Kayıt olma ve giriş yapma
- 📝 **Arama Geçmişi**: Geçmiş aramalarınızı kaydedin ve tekrar kullanın
- ⭐ **Favoriler**: Sık kullandığınız rotaları favorilere ekleyin
- 📊 **Trafik Seviyeleri**: Az, Orta, Çok trafik durumlarını renkli gösterim ile görün

## 🛠️ Teknolojiler

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM
- **MySQL** - Veritabanı
- **scikit-learn** - Makine öğrenmesi modeli
- **bcrypt** - Şifre hashleme

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Google Maps API** - Harita ve yönlendirme

## 📋 Gereksinimler

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Google Maps API Key

## 🚀 Kurulum

### 1. Repository'yi klonlayın

```bash
git clone <repository-url>
cd asu_proje
```

### 2. Backend Kurulumu

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Veritabanı Kurulumu

MySQL'de veritabanı oluşturun:

```sql
CREATE DATABASE traffic_db;
```

`backend/.env` dosyası oluşturun:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/traffic_db
```

### 4. Frontend Kurulumu

```bash
cd frontend
npm install
```

### 5. Environment Variables

`frontend/.env` dosyası oluşturun:

```env
VITE_BACKEND_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🏃 Çalıştırma

### Backend

```bash
cd backend
source venv/bin/activate
python3 app.py
```

Backend `http://localhost:5001` adresinde çalışacak.

### Frontend

```bash
cd frontend
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

## 🚂 Railway Deployment

### 1. Railway Hesabı Oluşturma

1. [Railway.app](https://railway.app) adresine gidin
2. GitHub hesabınızla giriş yapın
3. "New Project" butonuna tıklayın
4. "Deploy from GitHub repo" seçeneğini seçin

### 2. Repository'yi Bağlama

1. GitHub repository'nizi seçin
2. Railway otomatik olarak projeyi algılayacak

### 3. Environment Variables Ayarlama

Railway dashboard'da **Variables** sekmesine gidin ve şu değişkenleri ekleyin:

#### Backend Servisi için:
```
DATABASE_URL=mysql+pymysql://user:password@host:port/database
PORT=5001
```

#### Frontend Servisi için (eğer ayrı servis kullanıyorsanız):
```
VITE_BACKEND_URL=https://your-backend-url.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. MySQL Veritabanı Ekleme

1. Railway dashboard'da **+ New** butonuna tıklayın
2. **Database** > **Add MySQL** seçin
3. Railway otomatik olarak `MYSQL_URL` environment variable'ını ekleyecek

### 5. Build ve Deploy

Railway otomatik olarak:
- Backend için: `railway.json` dosyasındaki ayarları kullanır
- Frontend için: Vite build yapar ve static dosyaları serve eder

### 6. Domain Ayarlama

1. Railway dashboard'da servisinize tıklayın
2. **Settings** > **Generate Domain** ile ücretsiz domain alın
3. Veya kendi domain'inizi ekleyin

## 📁 Proje Yapısı

```
asu_proje/
├── backend/
│   ├── app.py              # Flask uygulaması
│   ├── database.py          # Database modelleri
│   ├── model_loader.py      # ML model yükleme
│   ├── trafik_modeli.pkl    # Eğitilmiş model
│   ├── requirements.txt     # Python bağımlılıkları
│   └── .env                 # Backend environment variables
├── frontend/
│   ├── src/
│   │   └── App.jsx          # Ana React component
│   ├── package.json         # Node bağımlılıkları
│   └── .env                 # Frontend environment variables
├── railway.json             # Railway deployment config
└── README.md                # Bu dosya
```

## 🔐 Güvenlik Notları

- `.env` dosyalarını asla commit etmeyin
- Google Maps API key'inizi güvende tutun
- Production'da CORS ayarlarını sınırlandırın
- Şifreler bcrypt ile hashlenir

## 📝 API Endpoints

### Authentication
- `POST /register` - Kullanıcı kaydı
- `POST /login` - Kullanıcı girişi

### Predictions
- `POST /predict` - Trafik tahmini

### History
- `GET /history?user_id=<id>` - Arama geçmişi
- `POST /history` - Arama kaydetme
- `DELETE /history/<id>?user_id=<id>` - Arama silme

### Favorites
- `GET /favorites?user_id=<id>` - Favoriler
- `POST /favorites` - Favori ekleme
- `DELETE /favorites/<id>?user_id=<id>` - Favori silme

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👤 Yazar

[Adınız]

## 🙏 Teşekkürler

- Google Maps API
- Railway.app
- Flask ve React toplulukları

