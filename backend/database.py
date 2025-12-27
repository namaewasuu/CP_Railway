"""
Database bağlantısı ve modeller
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

# Database bağlantı URL'i (environment variable'dan alınır)
# Railway'de MYSQL_URL veya DATABASE_URL kullanılabilir
DATABASE_URL = os.getenv('MYSQL_URL') or os.getenv('DATABASE_URL') or os.getenv(
    'MYSQLDATABASE_URL',  # Railway'in bazen kullandığı format
    'mysql+pymysql://user:password@localhost:3306/traffic_db'
)

# Eğer Railway'den geliyorsa formatı düzelt
if DATABASE_URL.startswith('mysql://'):
    DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://', 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ======================
#  DATABASE MODELLERİ
# ======================

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # İlişkiler
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class SearchHistory(Base):
    __tablename__ = 'search_history'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Arama bilgileri
    origin = Column(String(500), nullable=False)
    destination = Column(String(500), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    datetime = Column(DateTime, nullable=False)
    
    # Sonuç bilgileri
    traffic_level = Column(Integer, nullable=False)  # 0: Az, 1: Orta, 2: Çok
    traffic_label = Column(String(10), nullable=False)
    speed_kmh = Column(Float, nullable=False)
    estimated_minutes = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # İlişki
    user = relationship("User", back_populates="search_history")


class Favorite(Base):
    __tablename__ = 'favorites'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Arama bilgileri
    origin = Column(String(500), nullable=False)
    destination = Column(String(500), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    
    # İsim (kullanıcı tarafından verilebilir)
    name = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # İlişki
    user = relationship("User", back_populates="favorites")


# ======================
#  YARDIMCI FONKSİYONLAR
# ======================

def get_db():
    """Database session'ı döndürür"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Database tablolarını oluşturur"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tabloları oluşturuldu")


if __name__ == "__main__":
    init_db()

