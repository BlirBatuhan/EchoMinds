# 🔗 Backend Bağlantısı Kurulum Rehberi

Mobil uygulamanızı Rails backend'e bağlamak için adımları takip edin.

## ✅ 1. Backend Sunucusu Çalıştırın

```bash
cd voice_ai_api
rails server -p 3000
```

Backend şu adreste çalışacak: `http://localhost:3000`

## 🔑 2. API Token Alın

Backend sunucusunu başlattıktan sonra seed verilerinden API token'ı kopyalayın:

```bash
cd voice_ai_api
rails db:seed
```

Çıktıda şöyle bir satır göreceksiniz:
```
Student: student@example.com (API Token: 877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b)
```

Bu token'ı kopyalayın.

## 📝 3. Config Dosyasını Güncelleyin

`VoiceAIApp/config.ts` dosyasını açın ve `API_TOKEN` değerini güncelleyin:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  
  // Seed çıktısından aldığınız token'ı buraya yapıştırın
  API_TOKEN: '877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b',
  
  TIMEOUT: 30000,
};
```

## 🚀 4. Mobil Uygulamayı Çalıştırın

```bash
cd VoiceAIApp
npm start
```

## 🎯 5. Backend Kullanımı

Uygulamada artık iki mod var:

### Backend Modu (Önerilen) ✅
- **Backend Kullan** switch'ini açık tutun
- **"🌐 Backend Metin"** butonu backend'den rastgele metin çeker
- **"▶️ Oynat"** butonu backend üzerinden D-ID videosu oluşturur
- Tüm işlemler backend'de loglanır ve veritabanında saklanır

### Yerel Mod ⚠️
- **Backend Kullan** switch'ini kapatın
- **"🔄 Yeni Metin"** yerel metinlerden seçer
- **"▶️ Oynat"** direkt D-ID API'yi çağırır
- Hiçbir veri backend'e kaydedilmez

## 🔧 Troubleshooting

### "Backend'den metin alınamadı" Hatası

**Çözüm 1**: Backend sunucusunu kontrol edin
```bash
curl http://localhost:3000/api/v1/practice_texts/random?language=en
```

Yanıt alırsanız backend çalışıyor.

**Çözüm 2**: API URL'ini kontrol edin

iOS Simulator için:
```typescript
BASE_URL: 'http://localhost:3000/api/v1'
```

Android Emulator için:
```typescript
BASE_URL: 'http://10.0.2.2:3000/api/v1'
```

Fiziksel cihaz için (bilgisayarınızın IP'si):
```typescript
BASE_URL: 'http://192.168.1.100:3000/api/v1'
```

### "Unauthorized" Hatası

API token'ı hatalı veya eksik. `config.ts` dosyasındaki token'ı kontrol edin.

### "Video oluşturulurken hata" Hatası

Backend'de D-ID API anahtarları eksik olabilir:

```bash
# PowerShell (Windows)
$env:D_ID_API_KEY="your_key"
$env:ELEVEN_LABS_API_KEY="your_key"

# Linux/Mac
export D_ID_API_KEY="your_key"
export ELEVEN_LABS_API_KEY="your_key"
```

Ardından backend'i yeniden başlatın.

## 📊 Veritabanı Kontrol

Backend'de kaydedilen verileri görmek için:

```bash
cd voice_ai_api
rails console
```

```ruby
# Son 5 avatar session
AvatarSession.last(5)

# Kullanıcının tüm sessions
user = User.find_by(email: 'student@example.com')
user.avatar_sessions

# Transcript karşılaştırmaları
TranscriptComparison.all
```

## 🎨 Özellikler

### ✅ Backend'e Taşınan Özellikler

1. **Pratik Metinleri**
   - Backend'den dinamik metin çekme
   - Zorluk seviyesi filtreleme (beginner/intermediate/advanced)
   - Dil desteği (en, tr, es, fr, de)

2. **Avatar Video Oluşturma**
   - D-ID işlemleri backend'de
   - Background job ile async işlem
   - Polling ile durum takibi

3. **Session Yönetimi**
   - Her video oluşturma bir session kaydı
   - Video URL'leri veritabanında
   - Kullanıcı bazlı geçmiş

### 🔜 Gelecek Özellikler

1. **Transkripsiyon Entegrasyonu**
   - Ses kayıtlarını backend'e yükleme
   - AssemblyAI backend'den çağırma
   - Transcript karşılaştırmaları veritabanında

2. **Kullanıcı Yönetimi**
   - Kayıt/giriş ekranları
   - Kullanıcı profili
   - İlerleme takibi

3. **İstatistikler**
   - Toplam pratik sayısı
   - Ortalama benzerlik skoru
   - Zaman grafiği

## 📱 Test Senaryosu

1. Backend sunucusunu başlatın
2. Mobil uygulamayı açın
3. "Backend Kullan" switch'ini açın
4. "🌐 Backend Metin" butonuna basın
5. Backend'den metin geldiğini görün
6. "▶️ Oynat" butonuna basın
7. "Video oluşturuluyor..." mesajını görün
8. Video hazır olunca oynatıldığını görün
9. Backend console'da log kayıtlarını kontrol edin

## 🎉 Başarı!

Artık mobil uygulamanız Rails backend'e bağlı!

- ✅ Metinler backend'den geliyor
- ✅ Videolar backend'de oluşturuluyor
- ✅ Tüm işlemler loglanıyor
- ✅ Veriler veritabanında

Sorular için: `voice_ai_api/README_API.md`

