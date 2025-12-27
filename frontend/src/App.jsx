import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";


const defaultCenter = { lat: 41.015137, lng: 28.97953 }; // İstanbul

const libraries = ["places"];

// ------------------ LOGIN SAYFASI ------------------
function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!loginForm.email || !loginForm.password) {
        throw new Error("E-posta ve şifre zorunlu");
      }

      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Giriş başarısız");
      }

      const data = await res.json();
      onLogin({ id: data.id, email: data.email });
    } catch (err) {
      setError(err.message || "Giriş sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        throw new Error("Tüm alanlar zorunlu");
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error("Şifreler eşleşmiyor");
      }

      if (registerForm.password.length < 6) {
        throw new Error("Şifre en az 6 karakter olmalı");
      }

      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Kayıt başarısız");
      }

      const data = await res.json();
      // Kayıt başarılı, otomatik giriş yap
      onLogin({ id: data.id, email: data.email });
    } catch (err) {
      setError(err.message || "Kayıt sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    width: "100vw",
    background: "#ffffff",   // 👈 ARKAPLAN BEYAZ
    margin: 0,
    padding: 0,

    display: "flex",
    justifyContent: "center",  // 👈 YATAY ORTA
    alignItems: "center",       // 👈 DİKEY ORTA

    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }}
>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: "1.75rem 1.75rem 2rem",
          boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
        }}
      >
        {/* Logo / başlık */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "2px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, #7c3aed, #ec4899)",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Trafik Tahmin Paneli
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Devam etmek için hesabınıza giriş yapın.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            borderRadius: 999,
            backgroundColor: "#f3f4f6",
            padding: 4,
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 999,
              padding: "0.5rem 0.75rem",
              background: activeTab === "login" ? "linear-gradient(90deg, #7c3aed, #ec4899)" : "transparent",
              color: activeTab === "login" ? "#fff" : "#4b5563",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 999,
              padding: "0.5rem 0.75rem",
              background: activeTab === "register" ? "linear-gradient(90deg, #7c3aed, #ec4899)" : "transparent",
              color: activeTab === "register" ? "#fff" : "#4b5563",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Giriş Formu */}
        {activeTab === "login" && (
          <form
            onSubmit={handleLogin}
            style={{ display: "grid", gap: "0.85rem" }}
          >
            <label style={{ fontSize: 13, color: "#4b5563" }}>
              E-posta
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="ornek@eposta.com"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                  fontSize: 14,
                }}
                required
              />
            </label>

            <label style={{ fontSize: 13, color: "#4b5563" }}>
              Şifre
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                  fontSize: 14,
                }}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(147,51,234,0.4)",
              }}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        )}

        {/* Kayıt Formu */}
        {activeTab === "register" && (
          <form
            onSubmit={handleRegister}
            style={{ display: "grid", gap: "0.85rem" }}
          >
            <label style={{ fontSize: 13, color: "#4b5563" }}>
              E-posta
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="ornek@eposta.com"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                  fontSize: 14,
                }}
                required
              />
            </label>

            <label style={{ fontSize: 13, color: "#4b5563" }}>
              Şifre
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="En az 6 karakter"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                  fontSize: 14,
                }}
                required
              />
            </label>

            <label style={{ fontSize: 13, color: "#4b5563" }}>
              Şifre Tekrar
              <input
                type="password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Şifrenizi tekrar girin"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                  fontSize: 14,
                }}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(147,51,234,0.4)",
              }}
            >
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>
        )}

        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: 13,
              marginTop: 10,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------ TRAFİK SAYFASI ------------------
function TrafficPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("search"); // search | history | favorites
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [form, setForm] = useState({
    datetime: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [directions, setDirections] = useState(null);

  const [routeInfo, setRouteInfo] = useState({
    distanceText: "",
    durationText: "",
  });
  const [routeColor, setRouteColor] = useState("#3b82f6"); // varsayılan mavi

  // History ve Favorites state'leri
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const directionsRef = useRef(null);

  // Ekran boyutu değişikliğini dinle
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive harita stili
  const mapContainerStyle = {
    width: "100%",
    height: windowWidth < 1024 ? "400px" : "calc(100vh - 300px)",
    minHeight: windowWidth < 1024 ? "400px" : "500px",
    borderRadius: "16px",
    overflow: "hidden",
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // routeColor değiştiğinde directions'ı güncelle
  useEffect(() => {
    if (directionsRef.current && routeColor) {
      setDirections({ ...directionsRef.current });
    }
  }, [routeColor]);

  // History ve Favorites yükleme
  useEffect(() => {
    if (user?.id) {
      loadHistory();
      loadFavorites();
    }
  }, [user, activeTab]);

  const loadHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${BACKEND_URL}/history?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("History yükleme hatası:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadFavorites = async () => {
    if (!user?.id) return;
    setLoadingFavorites(true);
    try {
      const res = await fetch(`${BACKEND_URL}/favorites?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error("Favorites yükleme hatası:", err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleDateTimeChange = (e) => {
    setForm((prev) => ({ ...prev, datetime: e.target.value }));
  };

  const handleShowOnMap = async (e, overrideOriginPlace = null, overrideDestPlace = null) => {
    if (e) e.preventDefault();
    setError("");
    setResult(null);

    // Override place'ler varsa (programatik çağrıdan geliyorsa) onları kullan
    let originPlace = overrideOriginPlace;
    let destinationPlace = overrideDestPlace;

    // Override yoksa Autocomplete'ten al
    if (!originPlace || !destinationPlace) {
      if (!originRef.current || !destinationRef.current) {
        setError("Lütfen başlangıç ve varış noktalarını seçin.");
        return;
      }

      originPlace = originRef.current.getPlace();
      destinationPlace = destinationRef.current.getPlace();

      if (!originPlace || !destinationPlace) {
        setError("Lütfen geçerli adresler seçin (autocomplete listesinden).");
        return;
      }
    }

    if (!form.datetime) {
      setError("Lütfen tarih & saat seçin.");
      return;
    }

    try {
      setLoading(true);

      const origin = originPlace.formatted_address;
      const destination = destinationPlace.formatted_address;

      const directionsService = new google.maps.DirectionsService();

      const results = await directionsService.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(results);
      directionsRef.current = results;

      const leg = results.routes[0].legs[0];

      const distanceKm = leg.distance.value / 1000; // metre -> km
      const durationText = leg.duration.text;
      const distanceText = leg.distance.text;

      setRouteInfo({
        distanceText,
        durationText,
      });

      const startLoc = leg.start_location;
      const endLoc = leg.end_location;

      // Backend rota bazlı model için başlangıç ve varış koordinatları
      const payload = {
        datetime: form.datetime,
        start_lat: startLoc.lat(),
        start_lon: startLoc.lng(),
        end_lat: endLoc.lat(),
        end_lon: endLoc.lng(),
      };

      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Sunucudan hata döndü");
      }

      const data = await res.json();
      
      // Trafik seviyesine göre renk belirle
      let color = "#22c55e"; // Az -> yeşil
      if (data.traffic_level === 1) color = "#facc15";      // Orta -> sarı
      if (data.traffic_level === 2) color = "#ef4444";      // Çok -> kırmızı

      // Renk değişikliğini zorlamak için önce renk state'ini güncelle
      setRouteColor(color);
      
      setResult({
        ...data,
        origin,
        destination,
      });

      // Arama geçmişine kaydet
      if (user?.id) {
        try {
          const historyRes = await fetch(`${BACKEND_URL}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              origin,
              destination,
              origin_lat: startLoc.lat(),
              origin_lon: startLoc.lng(),
              destination_lat: endLoc.lat(),
              destination_lon: endLoc.lng(),
              datetime: form.datetime,
              traffic_level: data.traffic_level,
              traffic_label: data.traffic_label,
              speed_kmh: data.speed_kmh,
              estimated_minutes: data.estimated_minutes,
              distance_km: data.distance_km,
            }),
          });
          
          if (historyRes.ok) {
            // History kaydedildi, listeyi yenile
            loadHistory();
          } else {
            const errData = await historyRes.json().catch(() => ({}));
            console.error("History kaydetme hatası:", errData.error || "Bilinmeyen hata");
          }
        } catch (err) {
          console.error("History kaydetme hatası:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const renderTrafficBadge = () => {
    if (!result) return null;

    let color = "#22c55e";
    if (result.traffic_level === 1) color = "#facc15";
    if (result.traffic_level === 2) color = "#ef4444";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px",
          borderRadius: 999,
          backgroundColor: "#f5f5f5",
          fontSize: 14,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
        {result.traffic_label} trafik
      </span>
    );
  };

  if (loadError) {
    return <div>Google Maps yüklenirken hata oluştu: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Harita yükleniyor...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "0",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: windowWidth < 768 ? "100%" : "1400px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 0,
          paddingLeft: windowWidth < 768 ? "1rem" : "10rem",
          paddingRight: windowWidth < 768 ? "1rem" : "3rem",
          paddingTop: windowWidth < 768 ? "1rem" : "1rem",
          paddingBottom: windowWidth < 768 ? "1rem" : "1.5rem",
          boxShadow: "none",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
      >
        {/* Üst bar: başlık + kullanıcı */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: windowWidth < 768 ? "1fr" : "1fr 1fr", 
          gap: "1.5rem", 
          marginBottom: "0.5rem" 
        }}>
          {/* Sol: Başlık */}
          <div>
            <header>
              <h1
                style={{
                  fontSize: windowWidth < 768 ? 20 : 24,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: "2px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 30%, #34d399, #16a34a)",
                    }}
                  />
                </span>
                Trafik Yoğunluğu Tahmini
              </h1>
              <p style={{ color: "#6b7280", fontSize: windowWidth < 768 ? 12 : 14, marginTop: 4 }}>
                Başlangıç ve varış noktası ile gelecekteki bir tarih/saat için
                tahmini trafik yoğunluğunu görüntüleyin.
              </p>
            </header>
          </div>
          
          {/* Sağ: Kullanıcı & çıkış */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              fontSize: 13,
            }}
          >
            <div
              style={{
                textAlign: "right",
                maxWidth: 180,
              }}
            >
              <div style={{ fontWeight: 600, color: "#111827" }}>
                {user?.email || "Kullanıcı"}
              </div>
              <div style={{ color: "#9ca3af" }}>Oturum açık</div>
            </div>
            <button
              onClick={onLogout}
              style={{
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                padding: "0.4rem 0.75rem",
                background: "#f9fafb",
                fontSize: 12,
                cursor: "pointer",
                color: "#4b5563",
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Tabs - Full Width */}
        <div
          style={{
            display: "flex",
            gap: 8,
            borderRadius: 999,
            backgroundColor: "#f3f4f6",
            padding: 4,
            marginBottom: "1rem",
            fontSize: 14,
            fontWeight: 500,
            width: "100%",
          }}
        >
          <button
            onClick={() => setActiveTab("search")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 999,
              padding: "0.45rem 0.75rem",
              background:
                activeTab === "search"
                  ? "linear-gradient(90deg,#7c3aed,#ec4899)"
                  : "transparent",
              color: activeTab === "search" ? "#fff" : "#4b5563",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🔍 Arama
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 999,
              padding: "0.45rem 0.75rem",
              background:
                activeTab === "history"
                  ? "linear-gradient(90deg,#7c3aed,#ec4899)"
                  : "transparent",
              color: activeTab === "history" ? "#fff" : "#4b5563",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            📝 Geçmiş
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 999,
              padding: "0.45rem 0.75rem",
              background:
                activeTab === "favorites"
                  ? "linear-gradient(90deg,#7c3aed,#ec4899)"
                  : "transparent",
              color: activeTab === "favorites" ? "#fff" : "#4b5563",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ⭐ Favoriler
          </button>
        </div>

        {/* İçerik */}
        {activeTab === "search" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: windowWidth < 1024 ? "1fr" : "1fr 1fr",
              gap: windowWidth < 1024 ? "1.5rem" : "2rem",
              width: "100%",
            }}
          >
            {/* Sol: Form - Tam yarı genişlik */}
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                Başlangıç ve varış noktası ile gelecekteki tarih/saat seçin.
              </p>

              <form
                onSubmit={handleShowOnMap}
                style={{ display: "grid", gap: "0.75rem" }}
              >
                <label style={{ fontSize: 13, color: "#4b5563" }}>
                  Başlangıç noktası
                  <Autocomplete onLoad={(ref) => (originRef.current = ref)}>
                    <input
                      placeholder="Örn: Başakşehir, İstanbul"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.25rem",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    />
                  </Autocomplete>
                </label>

                <label style={{ fontSize: 13, color: "#4b5563" }}>
                  Varış noktası
                  <Autocomplete
                    onLoad={(ref) => (destinationRef.current = ref)}
                  >
                    <input
                      placeholder="Örn: Beykoz, İstanbul"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.25rem",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    />
                  </Autocomplete>
                </label>

                <label style={{ fontSize: 13, color: "#4b5563" }}>
                  Tarih & Saat
                  <input
                    type="datetime-local"
                    value={form.datetime}
                    onChange={handleDateTimeChange}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.25rem",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      marginTop: 4,
                      fontSize: 14,
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(90deg, #7c3aed, #ec4899)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 12px 24px rgba(147,51,234,0.4)",
                  }}
                >
                  {loading
                    ? "Hesaplanıyor..."
                    : "Haritada Göster ve Tahmin Al"}
                </button>
              </form>

              {/* Trafik Durumu Göstergesi */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 16,
                  fontSize: 13,
                  color: "#4b5563",
                  alignItems: "center",
                  width: "100%",
                  padding: "0.55rem 0.25rem",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                }}
              >
                <span style={{ fontWeight: 600 }}>Trafik Durumu:</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                    }}
                  />
                  Az
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#facc15",
                    }}
                  />
                  Orta
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                    }}
                  />
                  Yoğun
                </span>
              </div>

              {error && (
                <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10 }}>
                  {error}
                </p>
              )}

              {result && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "0.85rem 0.9rem",
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <strong>Sonuç</strong>
                    {renderTrafficBadge()}
                  </div>
                  <p style={{ margin: 0 }}>
                    <strong>Rota:</strong> {result.origin} →{" "}
                    {result.destination}
                  </p>
                  {routeInfo.distanceText && (
                    <p style={{ margin: 0 }}>
                      <strong>Mesafe:</strong> {routeInfo.distanceText}
                      {result.distance_km && ` (${result.distance_km} km)`}
                    </p>
                  )}
                  {result.estimated_minutes && (
                    <p style={{ margin: 0 }}>
                      <strong>Tahmini Süre:</strong>{" "}
                      {result.estimated_minutes} dk
                    </p>
                  )}
                  {result.speed_kmh && (
                    <p style={{ margin: 0 }}>
                      <strong>Ortalama Hız:</strong> {result.speed_kmh} km/s
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sağ: Harita - Tam yarı genişlik */}
            <div style={{ width: "100%" }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={10}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {directions && (
                <DirectionsRenderer
                  key={routeColor} // Renk değiştiğinde component'i yeniden mount et
                  directions={directions}
                  options={{
                    polylineOptions: {
                      strokeColor: routeColor,
                      strokeOpacity: 0.9,
                      strokeWeight: 6,
                    },
                  }}
                />
              )}
              </GoogleMap>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: "1rem" }}>
              Arama Geçmişi
            </h2>
            {loadingHistory ? (
              <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
            ) : history.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
                Henüz arama geçmişiniz yok.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                          {item.origin} → {item.destination}
                        </p>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: 12, color: "#6b7280" }}>
                          {item.datetime ? new Date(item.datetime).toLocaleString("tr-TR") : ""}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: 999,
                            backgroundColor: "#f5f5f5",
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                item.traffic_level === 0
                                  ? "#22c55e"
                                  : item.traffic_level === 1
                                  ? "#facc15"
                                  : "#ef4444",
                            }}
                          />
                          {item.traffic_label}
                        </span>
                        <button
                          onClick={async () => {
                            if (!user?.id) return;
                            try {
                              const res = await fetch(`${BACKEND_URL}/favorites`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  user_id: user.id,
                                  origin: item.origin,
                                  destination: item.destination,
                                  origin_lat: item.origin_lat || 0,
                                  origin_lon: item.origin_lon || 0,
                                  destination_lat: item.destination_lat || 0,
                                  destination_lon: item.destination_lon || 0,
                                }),
                              });
                              if (res.ok) {
                                loadFavorites();
                                alert("Favorilere eklendi!");
                              } else {
                                const err = await res.json();
                                if (err.error && err.error.includes("zaten mevcut")) {
                                  alert("Bu rota zaten favorilerinizde!");
                                } else {
                                  alert(err.error || "Favori eklenemedi");
                                }
                              }
                            } catch (err) {
                              console.error("Favori ekleme hatası:", err);
                              alert("Favori eklenirken hata oluştu");
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                            background: "transparent",
                            color: "#facc15",
                            cursor: "pointer",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Favorilere ekle"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={async () => {
                            if (!user?.id) return;
                            if (confirm("Bu arama geçmişini silmek istediğinizden emin misiniz?")) {
                              try {
                                const res = await fetch(
                                  `${BACKEND_URL}/history/${item.id}?user_id=${user.id}`,
                                  { method: "DELETE" }
                                );
                                if (res.ok) {
                                  loadHistory(); // Listeyi yenile
                                } else {
                                  const err = await res.json();
                                  alert(err.error || "Arama geçmişi silinemedi");
                                }
                              } catch (err) {
                                console.error("Arama geçmişi silme hatası:", err);
                                alert("Arama geçmişi silinirken hata oluştu");
                              }
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: 6,
                            border: "1px solid #ef4444",
                            background: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", fontSize: 12, color: "#6b7280" }}>
                      <span>Hız: {item.speed_kmh} km/h</span>
                      <span>Süre: {item.estimated_minutes} dk</span>
                      <span>Mesafe: {item.distance_km} km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div style={{ width: "100%" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: "1rem" }}>
              Favoriler
            </h2>
            {loadingFavorites ? (
              <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
            ) : favorites.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
                Henüz favori rotanız yok. Geçmiş aramalarınızdan yıldız butonuna tıklayarak favorilere ekleyebilirsiniz.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <div style={{ marginBottom: "0.75rem" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                        {fav.origin} → {fav.destination}
                      </p>
                      {fav.name && (
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: 12, color: "#6b7280" }}>
                          {fav.name}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={async () => {
                          // Arama sekmesine geç
                          setActiveTab("search");
                          
                          // Form alanlarını doldur ve otomatik arama yap
                          setTimeout(async () => {
                            try {
                              // Google Places API ile adresleri bul
                              const geocoder = new google.maps.Geocoder();
                              
                              // Origin için place bul
                              const originPlace = await new Promise((resolve) => {
                                geocoder.geocode({ address: fav.origin }, (results, status) => {
                                  if (status === 'OK' && results[0]) {
                                    // GeocodeResult'u PlaceResult formatına çevir
                                    const place = {
                                      formatted_address: results[0].formatted_address,
                                      geometry: results[0].geometry,
                                      place_id: results[0].place_id,
                                      name: results[0].formatted_address,
                                    };
                                    resolve(place);
                                  } else {
                                    resolve(null);
                                  }
                                });
                              });
                              
                              // Destination için place bul
                              const destPlace = await new Promise((resolve) => {
                                geocoder.geocode({ address: fav.destination }, (results, status) => {
                                  if (status === 'OK' && results[0]) {
                                    // GeocodeResult'u PlaceResult formatına çevir
                                    const place = {
                                      formatted_address: results[0].formatted_address,
                                      geometry: results[0].geometry,
                                      place_id: results[0].place_id,
                                      name: results[0].formatted_address,
                                    };
                                    resolve(place);
                                  } else {
                                    resolve(null);
                                  }
                                });
                              });
                              
                              if (!originPlace || !destPlace) {
                                alert("Adresler bulunamadı. Lütfen manuel olarak arama yapın.");
                                return;
                              }
                              
                              // Input alanlarını doldur (görsel için)
                              if (originRef.current && destinationRef.current) {
                                const originInput = originRef.current.inputField || 
                                  (originRef.current.getInputField ? originRef.current.getInputField() : null) ||
                                  (originRef.current.querySelector ? originRef.current.querySelector('input') : null);
                                const destInput = destinationRef.current.inputField || 
                                  (destinationRef.current.getInputField ? destinationRef.current.getInputField() : null) ||
                                  (destinationRef.current.querySelector ? destinationRef.current.querySelector('input') : null);
                                
                                if (originInput) {
                                  originInput.value = fav.origin;
                                }
                                if (destInput) {
                                  destInput.value = fav.destination;
                                }
                              }
                              
                              // Şu anki tarih/saat'i set et
                              const now = new Date();
                              const year = now.getFullYear();
                              const month = String(now.getMonth() + 1).padStart(2, '0');
                              const day = String(now.getDate()).padStart(2, '0');
                              const hours = String(now.getHours()).padStart(2, '0');
                              const minutes = String(now.getMinutes()).padStart(2, '0');
                              const datetimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                              setForm({ datetime: datetimeValue });
                              
                              // Kısa bir bekleme sonrası otomatik arama yap (place'leri direkt geçir)
                              setTimeout(() => {
                                handleShowOnMap(null, originPlace, destPlace);
                              }, 500);
                            } catch (err) {
                              console.error("Form doldurma hatası:", err);
                              alert("Form doldurulurken hata oluştu. Lütfen manuel olarak arama yapın.");
                            }
                          }, 300);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: 8,
                          border: "1px solid #7c3aed",
                          background: "transparent",
                          color: "#7c3aed",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        🔄 Tekrar Arama Yap
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Bu favoriyi silmek istediğinizden emin misiniz?")) {
                            try {
                              const res = await fetch(
                                `${BACKEND_URL}/favorites/${fav.id}?user_id=${user.id}`,
                                { method: "DELETE" }
                              );
                              if (res.ok) {
                                loadFavorites();
                              }
                            } catch (err) {
                              console.error("Favori silme hatası:", err);
                            }
                          }
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: 8,
                          border: "1px solid #ef4444",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------ APP: LOGIN Mİ, TRAFİK Mİ? ------------------
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TrafficPage user={user} onLogout={handleLogout} />;
}

export default App;
