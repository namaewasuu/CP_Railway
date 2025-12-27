# ⚡ Hızlı Deployment Özeti

## 🗄️ 1. Railway'de MySQL (2 dakika)

1. [railway.app](https://railway.app) → Giriş
2. **New Project** → **Database** → **Add MySQL**
3. **Variables** → `MYSQL_URL` değerini kopyala

---

## 🔧 2. Render'da Backend (5 dakika)

1. [render.com](https://render.com) → GitHub ile giriş
2. **New +** → **Web Service**
3. Repository: `namaewasuu/CP_Railway`
4. Ayarlar:
   - **Name**: `cp-railway-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
5. **Environment Variables**:
   - `DATABASE_URL` = Railway'den aldığınız `MYSQL_URL` (otomatik düzeltilir)
   - `PORT` = `5001`
6. **Create Web Service**
7. URL'i not edin: `https://cp-railway-backend.onrender.com`

---

## 🎨 3. Render'da Frontend (3 dakika)

1. **New +** → **Static Site**
2. Repository: `namaewasuu/CP_Railway`
3. Ayarlar:
   - **Name**: `cp-railway-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_BACKEND_URL` = Backend URL'iniz (`https://cp-railway-backend.onrender.com`)
   - `VITE_GOOGLE_MAPS_API_KEY` = Google Maps API key'iniz
5. **Create Static Site**
6. URL'i not edin: `https://cp-railway-frontend.onrender.com`

---

## ✅ 4. Test

- Backend: `https://cp-railway-backend.onrender.com/health` → `{"status":"ok"}`
- Frontend: `https://cp-railway-frontend.onrender.com` → Uygulama açılmalı

---

**Detaylı rehber için**: `DEPLOYMENT_RENDER.md`

