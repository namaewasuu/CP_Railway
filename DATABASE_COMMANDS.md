# 🗄️ Database Kontrol Komutları

## Tabloları Görmek

```bash
mysql -u root -e "USE traffic_db; SHOW TABLES;"
```

## Tablo Yapısını Görmek

```bash
# search_history tablosu
mysql -u root -e "USE traffic_db; DESCRIBE search_history;"

# favorites tablosu
mysql -u root -e "USE traffic_db; DESCRIBE favorites;"

# users tablosu
mysql -u root -e "USE traffic_db; DESCRIBE users;"
```

## Verileri Görmek

```bash
# Tüm arama geçmişi
mysql -u root -e "USE traffic_db; SELECT * FROM search_history ORDER BY created_at DESC;"

# Son 5 arama
mysql -u root -e "USE traffic_db; SELECT id, user_id, origin, destination, traffic_label, created_at FROM search_history ORDER BY created_at DESC LIMIT 5;"

# Tüm favoriler
mysql -u root -e "USE traffic_db; SELECT * FROM favorites ORDER BY created_at DESC;"

# Kullanıcılar
mysql -u root -e "USE traffic_db; SELECT * FROM users;"
```

## Kayıt Sayısı

```bash
# Toplam kayıt sayıları
mysql -u root -e "USE traffic_db; SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM search_history) as history,
  (SELECT COUNT(*) FROM favorites) as favorites;"
```

## Belirli Kullanıcının Verileri

```bash
# User ID 1'in arama geçmişi
mysql -u root -e "USE traffic_db; SELECT * FROM search_history WHERE user_id = 1 ORDER BY created_at DESC;"

# User ID 1'in favorileri
mysql -u root -e "USE traffic_db; SELECT * FROM favorites WHERE user_id = 1 ORDER BY created_at DESC;"
```

## Veri Silme (Dikkatli!)

```bash
# Tüm arama geçmişini sil
mysql -u root -e "USE traffic_db; DELETE FROM search_history;"

# Tüm favorileri sil
mysql -u root -e "USE traffic_db; DELETE FROM favorites;"

# Belirli bir kaydı sil
mysql -u root -e "USE traffic_db; DELETE FROM search_history WHERE id = 1;"
```

## Detaylı Sorgu Örnekleri

```bash
# Bugün yapılan aramalar
mysql -u root -e "USE traffic_db; SELECT * FROM search_history WHERE DATE(created_at) = CURDATE();"

# En çok trafik olan aramalar
mysql -u root -e "USE traffic_db; SELECT origin, destination, traffic_label, speed_kmh FROM search_history WHERE traffic_level = 2 ORDER BY created_at DESC;"

# Ortalama hız istatistikleri
mysql -u root -e "USE traffic_db; SELECT 
  AVG(speed_kmh) as avg_speed,
  MIN(speed_kmh) as min_speed,
  MAX(speed_kmh) as max_speed,
  COUNT(*) as total_searches
FROM search_history;"
```

## MySQL'e Interaktif Giriş

```bash
mysql -u root -p traffic_db
```

Sonra SQL komutlarını yazabilirsiniz:
```sql
SHOW TABLES;
SELECT * FROM search_history LIMIT 10;
EXIT;
```


