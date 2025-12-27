import pandas as pd
import joblib
import os
from math import radians, cos, sin, asin, atan2, degrees, sqrt

class TrafficModel:
    def __init__(self, model_path='trafik_modeli.pkl'):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        """Model dosyasını yükler."""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f"✅ Model yüklendi: {self.model_path}")
            except Exception as e:
                print(f"❌ Model yüklenemedi: {e}")
        else:
            print(f"⚠️ Dosya bulunamadı: {self.model_path}. Lütfen önce 'train_model.py' çalıştırın.")

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """İki nokta arası mesafeyi km cinsinden hesaplar"""
        R = 6371  # Dünya yarıçapı (km)
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        # Numerik hataları önlemek için a değerini sınırla
        a = min(1.0, max(0.0, a))
        c = 2 * asin(sqrt(a)) if a > 0 else 0
        return R * c

    def _calculate_bearing(self, lat1, lon1, lat2, lon2):
        """İki nokta arası yön açısını hesaplar (0-360 derece)"""
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        y = sin(dlon) * cos(lat2)
        x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
        bearing = atan2(y, x)
        bearing = degrees(bearing)
        bearing = (bearing + 360) % 360
        return bearing

    def predict_route(self, start_lat, start_lon, end_lat, end_lon, input_datetime):
        """Rota bazlı tahmin yapar (yeni model için)"""
        if self.model is None:
            return None 

        dt_obj = pd.to_datetime(input_datetime)
        
        # Rota özelliklerini hesapla
        distance = self._haversine_distance(start_lat, start_lon, end_lat, end_lon)
        bearing = self._calculate_bearing(start_lat, start_lon, end_lat, end_lon)
        
        input_data = pd.DataFrame({
            'start_lat': [float(start_lat)],
            'start_lon': [float(start_lon)],
            'end_lat': [float(end_lat)],
            'end_lon': [float(end_lon)],
            'distance': [distance],
            'bearing': [bearing],
            'hour': [dt_obj.hour],
            'day_of_week': [dt_obj.dayofweek],
            'month': [dt_obj.month]
        })

        try:
            prediction = self.model.predict(input_data)
            return float(prediction[0])
        except Exception as e:
            print(f"Tahmin hatası: {e}")
            return None

    def predict(self, latitude, longitude, input_datetime):
        """Eski model uyumluluğu için (tek nokta tahmini) - artık kullanılmıyor"""
        if self.model is None:
            return None 
        # Bu metod artık kullanılmıyor, rota bazlı model için predict_route kullanılmalı
        return None

