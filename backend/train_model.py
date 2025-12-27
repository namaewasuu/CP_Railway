import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
from math import radians, cos, sin, asin, sqrt, atan2, degrees
import os

def haversine_distance(lat1, lon1, lat2, lon2):
    """İki nokta arası mesafeyi km cinsinden hesaplar (Haversine formülü)"""
    R = 6371  # Dünya yarıçapı (km)
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    # Numerik hataları önlemek için a değerini sınırla
    a = min(1.0, max(0.0, a))
    c = 2 * asin(sqrt(a))
    return R * c

def calculate_bearing(lat1, lon1, lat2, lon2):
    """İki nokta arası yön açısını hesaplar (0-360 derece)"""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    y = sin(dlon) * cos(lat2)
    x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
    bearing = atan2(y, x)
    bearing = degrees(bearing)
    bearing = (bearing + 360) % 360
    return bearing

def generate_route_points(lat1, lon1, lat2, lon2, num_points=12):
    """İki nokta arası rota noktalarını oluşturur"""
    points = []
    for i in range(num_points + 1):
        ratio = i / num_points
        current_lat = lat1 + (lat2 - lat1) * ratio
        current_lon = lon1 + (lon2 - lon1) * ratio
        points.append((current_lat, current_lon))
    return points

def create_route_dataset(df, num_routes_per_timestamp=5):
    """CSV verilerinden rota bazlı veri seti oluşturur"""
    print("🔄 Rota veri seti oluşturuluyor...")
    
    route_data = []
    
    # Zaman dilimlerine göre grupla
    df['DATE_TIME'] = pd.to_datetime(df['DATE_TIME'])
    grouped = df.groupby('DATE_TIME')
    
    total_groups = len(grouped)
    processed = 0
    
    for timestamp, group in grouped:
        if len(group) < 2:
            continue
        
        # Aynı zaman dilimindeki noktalardan rastgele rota çiftleri oluştur
        group_indices = group.index.tolist()
        
        for _ in range(min(num_routes_per_timestamp, len(group) // 2)):
            if len(group_indices) < 2:
                break
            
            # Rastgele başlangıç ve varış noktaları seç
            start_idx = np.random.choice(group_indices)
            group_indices.remove(start_idx)
            
            if len(group_indices) == 0:
                break
                
            end_idx = np.random.choice(group_indices)
            group_indices.remove(end_idx)
            
            start_row = group.loc[start_idx]
            end_row = group.loc[end_idx]
            
            start_lat = start_row['LATITUDE']
            start_lon = start_row['LONGITUDE']
            end_lat = end_row['LATITUDE']
            end_lon = end_row['LONGITUDE']
            
            # Rota noktalarını oluştur
            route_points = generate_route_points(start_lat, start_lon, end_lat, end_lon, num_points=12)
            
            # Rota üzerindeki noktalara en yakın veri noktalarını bul ve ortalama hızı hesapla
            route_speeds = []
            for r_lat, r_lon in route_points:
                # En yakın noktayı bul (basit mesafe hesabı)
                distances = np.sqrt(
                    (group['LATITUDE'] - r_lat)**2 + 
                    (group['LONGITUDE'] - r_lon)**2
                )
                nearest_idx = distances.idxmin()
                nearest_speed = group.loc[nearest_idx, 'AVERAGE_SPEED']
                route_speeds.append(nearest_speed)
            
            avg_route_speed = np.mean(route_speeds)
            
            # Rota özelliklerini hesapla
            distance = haversine_distance(start_lat, start_lon, end_lat, end_lon)
            bearing = calculate_bearing(start_lat, start_lon, end_lat, end_lon)
            
            # Zaman özellikleri
            dt = pd.to_datetime(timestamp)
            
            route_data.append({
                'start_lat': start_lat,
                'start_lon': start_lon,
                'end_lat': end_lat,
                'end_lon': end_lon,
                'distance': distance,
                'bearing': bearing,
                'hour': dt.hour,
                'day_of_week': dt.dayofweek,
                'month': dt.month,
                'avg_speed': avg_route_speed
            })
        
        processed += 1
        if processed % 100 == 0:
            print(f"  İşlenen zaman dilimi: {processed}/{total_groups} ({len(route_data)} rota oluşturuldu)")
    
    print(f"✅ Toplam {len(route_data)} rota verisi oluşturuldu.")
    return pd.DataFrame(route_data)

def train_and_save_model():
    print("⏳ Veri yükleniyor...")
    
    # CSV dosyası bir üst klasörde
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'ibb_traffic_2024_12.csv')
    csv_path = os.path.normpath(csv_path)
    
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"HATA: '{csv_path}' dosyası bulunamadı!")
        return

    print("⚙️ Rota bazlı veri seti oluşturuluyor...")
    route_df = create_route_dataset(df, num_routes_per_timestamp=5)
    
    if len(route_df) == 0:
        print("❌ Rota veri seti oluşturulamadı!")
        return

    # Özellikler: Başlangıç/varış koordinatları + rota özellikleri + zaman
    features = [
        'start_lat', 'start_lon', 
        'end_lat', 'end_lon',
        'distance', 'bearing',
        'hour', 'day_of_week', 'month'
    ]
    X = route_df[features]
    y = route_df['avg_speed']

    print(f"📊 Veri seti boyutu: {len(route_df)} rota")
    print(f"📊 Özellik sayısı: {len(features)}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("🚀 Model eğitiliyor (Bu işlem veri boyutuna göre sürebilir)...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"✅ Model Eğitimi Tamamlandı! Başarı Skoru (R^2): {score:.2f}")

    # Model dosyasını backend klasörüne kaydet
    model_path = os.path.join(os.path.dirname(__file__), 'trafik_modeli.pkl')
    joblib.dump(model, model_path)
    print(f"💾 Model '{model_path}' olarak kaydedildi.")

if __name__ == "__main__":
    train_and_save_model()

