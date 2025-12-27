# 🧪 Local Test Setup Rehberi

## 1. MySQL Kurulumu ve Başlatma

Eğer MySQL kurulu değilse:
```bash
brew install mysql
brew services start mysql
```

## 2. Database Oluşturma

MySQL'e bağlanın:
```bash
mysql -u root -p
```

Sonra database oluşturun:
```sql
CREATE DATABASE traffic_db;
EXIT;
```

## 3. .env Dosyası Oluşturma

`backend` klasöründe `.env` dosyası oluşturun:
```bash
cd backend
nano .env
```

İçine şunu yazın (şifrenizi değiştirin):
```
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/traffic_db
```

## 4. Database Tablolarını Oluşturma

```bash
source venv/bin/activate
python3 database.py
```

Başarılı olursa: "✅ Database tabloları oluşturuldu" mesajını göreceksiniz.

## 5. Backend'i Çalıştırma

```bash
source venv/bin/activate
python3 app.py
```

Backend `http://localhost:5001` adresinde çalışacak.

## 6. Frontend'i Çalıştırma (Ayrı terminal)

```bash
cd frontend
npm install  # İlk kez çalıştırıyorsanız
npm run dev
```

## Test Endpoints

- Health check: http://localhost:5001/health
- Predict: POST http://localhost:5001/predict
- History: GET http://localhost:5001/history?user_id=1
- Favorites: GET http://localhost:5001/favorites?user_id=1


