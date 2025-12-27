from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime as dt
import pandas as pd
from model_loader import TrafficModel
from math import radians, cos, sin, asin, sqrt
from database import get_db, init_db, SearchHistory, Favorite, User
from contextlib import contextmanager
import bcrypt

# ======================
#  Flask Uygulaması
# ======================
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database başlatma (ilk çalıştırmada tabloları oluşturur)
try:
    init_db()
except Exception as e:
    print(f"⚠️ Database başlatma hatası (devam ediliyor): {e}")

@contextmanager
def get_db_session():
    """Database session context manager"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

# ======================
#  ROTA BAZLI MODEL YÜKLEME
# ======================
route_model = TrafficModel()  # trafik_modeli.pkl dosyasını yükler

# Trafik seviyesi label mapping
CLASS_LABELS = {
    0: "Az",
    1: "Orta",
    2: "Çok"
}

# ======================
#  YARDIMCI FONKSİYONLAR
# ======================
def apply_time_factor(base_speed, datetime_str):
    """Saat faktörünü uygular"""
    dt_obj = pd.to_datetime(datetime_str)
    hour = dt_obj.hour
    
    adjusted_speed = base_speed
    
    if hour >= 22 or hour < 6:
        adjusted_speed = base_speed * 1.4 
    elif 7 <= hour <= 10:
        adjusted_speed = base_speed * 0.7
    elif 17 <= hour <= 20:
        adjusted_speed = base_speed * 0.65
    else:
        adjusted_speed = base_speed * 1.1
    
    if adjusted_speed < 5: adjusted_speed = 5
    if adjusted_speed > 130: adjusted_speed = 130
    
    return adjusted_speed

def speed_to_traffic_level(speed):
    """Hız değerini trafik seviyesine çevirir"""
    # 50 km/h üzeri: Az trafik (akıcı)
    # 30-50 km/h: Orta trafik
    # 30 km/h altı: Çok trafik (yoğun)
    if speed >= 50:
        return 0, "Az"  # Akıcı trafik
    elif speed >= 30:
        return 1, "Orta"
    else:
        return 2, "Çok"  # Yoğun trafik

# ======================
#  AUTHENTICATION ENDPOINTLERİ
# ======================
@app.route("/register", methods=["POST"])
def register():
    """Yeni kullanıcı kaydı"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body bekleniyor"}), 400
    
    email = data.get("email", "").strip()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "E-posta ve şifre zorunlu"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Şifre en az 6 karakter olmalı"}), 400
    
    try:
        with get_db_session() as db:
            # Email zaten kullanılıyor mu?
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                return jsonify({"error": "Bu e-posta adresi zaten kullanılıyor"}), 400
            
            # Şifreyi hash'le
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Yeni kullanıcı oluştur
            new_user = User(
                email=email,
                password_hash=password_hash
            )
            db.add(new_user)
            db.flush()
            
            return jsonify({
                "id": new_user.id,
                "email": new_user.email,
                "message": "Kayıt başarılı"
            }), 201
    except Exception as e:
        print(f">> Kayıt hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    """Kullanıcı girişi"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body bekleniyor"}), 400
    
    email = data.get("email", "").strip()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "E-posta ve şifre zorunlu"}), 400
    
    try:
        with get_db_session() as db:
            # Kullanıcıyı bul
            user = db.query(User).filter(User.email == email).first()
            
            if not user:
                return jsonify({"error": "E-posta veya şifre hatalı"}), 401
            
            # Şifreyi kontrol et
            if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
                return jsonify({"error": "E-posta veya şifre hatalı"}), 401
            
            return jsonify({
                "id": user.id,
                "email": user.email,
                "message": "Giriş başarılı"
            }), 200
    except Exception as e:
        print(f">> Giriş hatası: {e}")
        return jsonify({"error": str(e)}), 500


# ======================
#  ENDPOINTLER
# ======================
@app.route("/health", methods=["GET"])
def health():
    """Basit sağlık kontrol endpoint'i."""
    route_status = "ok" if route_model.model is not None else "not_loaded"
    return jsonify({
        "status": "ok" if route_status == "ok" else "error",
        "route_model": route_status,
        "model_type": "route_based"
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    """
    ROTA BAZLI MODEL endpoint'i.
    Beklenen JSON örneği:
    {
      "datetime": "2025-11-27T08:30",
      "start_lat": 40.9982,
      "start_lon": 29.0643,
      "end_lat": 41.0421,
      "end_lon": 29.2510
    }
    """
    if route_model.model is None:
        return jsonify({"error": "Rota modeli yüklü değil"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body bekleniyor"}), 400

    # 1) Tarih & saat
    datetime_str = data.get("datetime")
    if not datetime_str:
        return jsonify({"error": "datetime alanı zorunlu"}), 400

    try:
        dt_obj = dt.datetime.fromisoformat(datetime_str)
        datetime_str_formatted = dt_obj.strftime("%Y-%m-%dT%H:%M")
    except ValueError:
        return jsonify({"error": "datetime formatı hatalı. Örnek: 2025-11-27T08:30"}), 400

    # 2) Rota koordinatları
    try:
        start_lat = float(data.get("start_lat"))
        start_lon = float(data.get("start_lon"))
        end_lat = float(data.get("end_lat"))
        end_lon = float(data.get("end_lon"))
    except (TypeError, ValueError):
        return jsonify({"error": "Rota koordinatları (start_lat, start_lon, end_lat, end_lon) zorunlu"}), 400

    # 3) Rota bazlı tahmin
    try:
        raw_speed = route_model.predict_route(start_lat, start_lon, end_lat, end_lon, datetime_str_formatted)
    except Exception as e:
        print(f">> Rota model tahmin hatası: {e}")
        return jsonify({"error": f"Rota model tahmin hatası: {str(e)}"}), 500

    if raw_speed is None:
        return jsonify({"error": "Tahmin yapılamadı"}), 500

    # 4) Saat faktörünü uygula
    final_speed = apply_time_factor(raw_speed, datetime_str_formatted)

    # 5) Mesafe hesapla (tahmini süre için)
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [start_lat, start_lon, end_lat, end_lon])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    a = min(1.0, max(0.0, a))
    distance_km = R * 2 * asin(sqrt(a)) if a > 0 else 0

    # 6) Trafik seviyesi ve tahmini süre
    traffic_level, traffic_label = speed_to_traffic_level(final_speed)
    estimated_minutes = round(distance_km / final_speed * 60, 1) if final_speed > 0 else 0

    return jsonify({
        "traffic_level": traffic_level,
        "traffic_label": traffic_label,
        "speed_kmh": round(final_speed, 1),
        "raw_speed_kmh": round(raw_speed, 1),
        "estimated_minutes": estimated_minutes,
        "distance_km": round(distance_km, 2),
        "used_features": {
            "start_lat": start_lat,
            "start_lon": start_lon,
            "end_lat": end_lat,
            "end_lon": end_lon,
            "hour": dt_obj.hour,
            "day_of_week": dt_obj.weekday(),
            "month": dt_obj.month
        },
        "model_type": "route_based"
    }), 200


# ======================
#  DATABASE ENDPOINTLERİ
# ======================

@app.route("/history", methods=["GET"])
def get_history():
    """Kullanıcının arama geçmişini döndürür"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id parametresi gerekli"}), 400
    
    try:
        with get_db_session() as db:
            history = db.query(SearchHistory).filter(
                SearchHistory.user_id == user_id
            ).order_by(SearchHistory.created_at.desc()).limit(50).all()
            
            return jsonify({
                "history": [{
                    "id": h.id,
                    "origin": h.origin,
                    "destination": h.destination,
                    "datetime": h.datetime.isoformat() if h.datetime else None,
                    "traffic_level": h.traffic_level,
                    "traffic_label": h.traffic_label,
                    "speed_kmh": h.speed_kmh,
                    "estimated_minutes": h.estimated_minutes,
                    "distance_km": h.distance_km,
                    "created_at": h.created_at.isoformat() if h.created_at else None
                } for h in history]
            }), 200
    except Exception as e:
        print(f">> History getirme hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/history", methods=["POST"])
def save_history():
    """Yeni arama geçmişi kaydeder"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body bekleniyor"}), 400
    
    required_fields = ["user_id", "origin", "destination", "origin_lat", "origin_lon", 
                       "destination_lat", "destination_lon", "datetime", "traffic_level",
                       "traffic_label", "speed_kmh", "estimated_minutes", "distance_km"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} alanı zorunlu"}), 400
    
    try:
        datetime_obj = dt.datetime.fromisoformat(data["datetime"])
    except ValueError:
        return jsonify({"error": "datetime formatı hatalı"}), 400
    
    try:
        with get_db_session() as db:
            # User var mı kontrol et, yoksa oluştur
            user = db.query(User).filter(User.id == data["user_id"]).first()
            if not user:
                # Demo mod: User yoksa otomatik oluştur
                # Email olarak user_id kullan (demo için)
                user = User(
                    id=data["user_id"],
                    email=f"user_{data['user_id']}@demo.com",
                    password_hash="demo"  # Demo mod, gerçek şifre yok
                )
                db.add(user)
                db.flush()
            
            history_entry = SearchHistory(
                user_id=data["user_id"],
                origin=data["origin"],
                destination=data["destination"],
                origin_lat=float(data["origin_lat"]),
                origin_lon=float(data["origin_lon"]),
                destination_lat=float(data["destination_lat"]),
                destination_lon=float(data["destination_lon"]),
                datetime=datetime_obj,
                traffic_level=int(data["traffic_level"]),
                traffic_label=data["traffic_label"],
                speed_kmh=float(data["speed_kmh"]),
                estimated_minutes=float(data["estimated_minutes"]),
                distance_km=float(data["distance_km"])
            )
            db.add(history_entry)
            db.flush()
            
            return jsonify({
                "id": history_entry.id,
                "message": "Arama geçmişi kaydedildi"
            }), 201
    except Exception as e:
        print(f">> History kaydetme hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/history/<int:history_id>", methods=["DELETE"])
def delete_history(history_id):
    """Arama geçmişi kaydını siler"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id parametresi gerekli"}), 400
    
    try:
        with get_db_session() as db:
            history_entry = db.query(SearchHistory).filter(
                SearchHistory.id == history_id,
                SearchHistory.user_id == user_id
            ).first()
            
            if not history_entry:
                return jsonify({"error": "Arama geçmişi kaydı bulunamadı"}), 404
            
            db.delete(history_entry)
            
            return jsonify({"message": "Arama geçmişi kaydı silindi"}), 200
    except Exception as e:
        print(f">> History silme hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/favorites", methods=["GET"])
def get_favorites():
    """Kullanıcının favorilerini döndürür"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id parametresi gerekli"}), 400
    
    try:
        with get_db_session() as db:
            favorites = db.query(Favorite).filter(
                Favorite.user_id == user_id
            ).order_by(Favorite.created_at.desc()).all()
            
            return jsonify({
                "favorites": [{
                    "id": f.id,
                    "origin": f.origin,
                    "destination": f.destination,
                    "origin_lat": f.origin_lat,
                    "origin_lon": f.origin_lon,
                    "destination_lat": f.destination_lat,
                    "destination_lon": f.destination_lon,
                    "name": f.name,
                    "created_at": f.created_at.isoformat() if f.created_at else None
                } for f in favorites]
            }), 200
    except Exception as e:
        print(f">> Favorites getirme hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/favorites", methods=["POST"])
def add_favorite():
    """Yeni favori ekler"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body bekleniyor"}), 400
    
    required_fields = ["user_id", "origin", "destination", "origin_lat", "origin_lon",
                       "destination_lat", "destination_lon"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} alanı zorunlu"}), 400
    
    try:
        with get_db_session() as db:
            # User var mı kontrol et, yoksa oluştur
            user = db.query(User).filter(User.id == data["user_id"]).first()
            if not user:
                # Demo mod: User yoksa otomatik oluştur
                user = User(
                    id=data["user_id"],
                    email=f"user_{data['user_id']}@demo.com",
                    password_hash="demo"  # Demo mod, gerçek şifre yok
                )
                db.add(user)
                db.flush()
            
            # Aynı favori var mı kontrol et
            existing = db.query(Favorite).filter(
                Favorite.user_id == data["user_id"],
                Favorite.origin == data["origin"],
                Favorite.destination == data["destination"]
            ).first()
            
            if existing:
                return jsonify({"error": "Bu favori zaten mevcut", "id": existing.id}), 400
            
            favorite = Favorite(
                user_id=data["user_id"],
                origin=data["origin"],
                destination=data["destination"],
                origin_lat=float(data["origin_lat"]),
                origin_lon=float(data["origin_lon"]),
                destination_lat=float(data["destination_lat"]),
                destination_lon=float(data["destination_lon"]),
                name=data.get("name")
            )
            db.add(favorite)
            db.flush()
            
            return jsonify({
                "id": favorite.id,
                "message": "Favori eklendi"
            }), 201
    except Exception as e:
        print(f">> Favorite ekleme hatası: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/favorites/<int:favorite_id>", methods=["DELETE"])
def delete_favorite(favorite_id):
    """Favoriyi siler"""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id parametresi gerekli"}), 400
    
    try:
        with get_db_session() as db:
            favorite = db.query(Favorite).filter(
                Favorite.id == favorite_id,
                Favorite.user_id == user_id
            ).first()
            
            if not favorite:
                return jsonify({"error": "Favori bulunamadı"}), 404
            
            db.delete(favorite)
            
            return jsonify({"message": "Favori silindi"}), 200
    except Exception as e:
        print(f">> Favorite silme hatası: {e}")
        return jsonify({"error": str(e)}), 500


# ======================
#  MAIN
# ======================
if __name__ == "__main__":
    import os
    port = int(os.getenv('PORT', 5001))
    print(">> Flask uygulaması başlatılıyor...")
    print(">> Authentication: POST /register, POST /login")
    print(">> Rota bazlı model: /predict")
    print(">> Health check: /health")
    print(">> History: GET/POST /history, DELETE /history/<id>")
    print(">> Favorites: GET/POST /favorites, DELETE /favorites/<id>")
    app.run(host="0.0.0.0", port=port, debug=False)

