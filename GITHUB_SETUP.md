# 📦 GitHub'a Push Rehberi

Bu rehber, projenizi GitHub'a yüklemek için adım adım talimatlar içerir.

## 🔧 Ön Hazırlık

1. **GitHub Hesabı**: [github.com](https://github.com) üzerinde hesap oluşturun
2. **Git Kurulumu**: Bilgisayarınızda Git'in kurulu olduğundan emin olun

## 📝 Adımlar

### 1. Git Repository Başlatma

Terminal'de proje dizinine gidin:

```bash
cd /Users/asu/Downloads/asu_proje
```

Git repository'sini başlatın:

```bash
git init
```

### 2. Dosyaları Stage'e Ekleme

Tüm dosyaları ekleyin (`.gitignore` otomatik olarak gereksiz dosyaları hariç tutar):

```bash
git add .
```

### 3. İlk Commit

```bash
git commit -m "Initial commit: İstanbul Trafik Tahmin Sistemi"
```

### 4. GitHub'da Repository Oluşturma

1. GitHub'a giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın
3. **"New repository"** seçin
4. Repository adını girin (örn: `istanbul-trafik-tahmin`)
5. **Public** veya **Private** seçin
6. **"Create repository"** butonuna tıklayın
7. **ÖNEMLİ**: "Initialize this repository with a README" seçeneğini **işaretlemeyin**

### 5. Remote Repository'yi Bağlama

GitHub'da oluşturduğunuz repository'nin URL'ini kopyalayın (örn: `https://github.com/kullaniciadi/istanbul-trafik-tahmin.git`)

Terminal'de:

```bash
git remote add origin https://github.com/kullaniciadi/istanbul-trafik-tahmin.git
```

### 6. Push Etme

```bash
git branch -M main
git push -u origin main
```

GitHub kullanıcı adı ve şifreniz (veya Personal Access Token) istenecek.

## 🔐 Personal Access Token (Önerilen)

GitHub artık şifre ile push kabul etmiyor. Personal Access Token kullanmanız gerekiyor:

1. GitHub > **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. **"Generate new token"** > **"Generate new token (classic)"**
3. Token'a bir isim verin (örn: "Railway Deployment")
4. **repo** scope'unu seçin
5. **"Generate token"** butonuna tıklayın
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)
7. Push yaparken şifre yerine bu token'ı kullanın

## ✅ Kontrol

GitHub repository sayfanızda tüm dosyaların göründüğünü kontrol edin.

## 🚀 Sonraki Adım

Artık Railway'e deploy edebilirsiniz! `DEPLOYMENT.md` dosyasına bakın.

