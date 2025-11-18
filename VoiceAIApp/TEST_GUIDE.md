# 🧪 Test Rehberi - Backend Entegrasyonu

## Hızlı Test Adımları

### 1️⃣ Backend'i Hazırlayın (5 dk)

```bash
# Terminal 1 - Backend sunucusu
cd voice_ai_api
rails server -p 3000
```

Backend çalışıyor mu kontrol:
```bash
curl http://localhost:3000/api/v1/practice_texts/random?language=en
```

Başarılı yanıt örneği:
```json
{
  "id": 1,
  "content": "Hello, how are you today?",
  "difficulty": "beginner",
  "language": "en",
  "active": true
}
```

### 2️⃣ API Token'ı Alın (1 dk)

Rails console'u açın:
```bash
cd voice_ai_api
rails console
```

Token'ı alın:
```ruby
User.find_by(email: 'student@example.com').api_token_digest
```

Token'ı kopyalayın (örnek):
```
877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b
```

### 3️⃣ Config'i Güncelleyin (1 dk)

`VoiceAIApp/config.ts` dosyasını açın:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  API_TOKEN: 'BURAYA_KOPYALADIGINIZ_TOKEN', // ⬅️ Buraya yapıştırın
  TIMEOUT: 30000,
};
```

### 4️⃣ Mobil Uygulamayı Başlatın (2 dk)

```bash
# Terminal 2 - Mobil uygulama
cd VoiceAIApp
npm start
```

### 5️⃣ Test Senaryoları

#### Test 1: Backend'den Metin Çekme ✅

1. Uygulamayı açın
2. **"Backend Kullan"** switch'ini **AÇIK** yapın
3. **"🌐 Backend Metin"** butonuna basın
4. **Beklenen**: Backend'den rastgele bir cümle gelir

**Console Log'ları:**
```
Backend'den metin yükleniyor...
Backend'den metin alındı: {id: 1, content: "Hello, how are you today?", ...}
```

**Başarısız olursa:**
- Backend çalışıyor mu? → `rails server` kontrolü
- API token doğru mu? → `config.ts` kontrolü
- Network bağlantısı var mı? → iOS Simulator ise `localhost`, Android Emulator ise `10.0.2.2`

#### Test 2: Backend Üzerinden Video Oluşturma ✅

**⚠️ Önkoşul**: D-ID ve ElevenLabs API anahtarları backend'de tanımlı olmalı

```bash
# PowerShell
$env:D_ID_API_KEY="your_d_id_key"
$env:ELEVEN_LABS_API_KEY="your_elevenlabs_key"
rails server -p 3000
```

**Test:**
1. Test 1'i başarıyla tamamlayın (metin gelsin)
2. **"▶️ Oynat"** butonuna basın
3. **Beklenen**: 
   - "Video oluşturuluyor..." mesajı
   - 20-30 saniye bekleme
   - Video oynatılır

**Console Log'ları:**
```
Backend üzerinden avatar videosu oluşturuluyor...
Avatar session oluşturuldu: 1
Video oluşturma başladı, bekleniyor...
Video hazır: https://d-id-talks-prod.s3.us-west-2.amazonaws.com/...
```

**Backend Log'ları (rails server terminal):**
```
Started POST "/api/v1/avatar_sessions"
  AvatarSession Create (0.5ms)
  
Started POST "/api/v1/avatar_sessions/1/generate_video"
  Enqueued GenerateAvatarVideoJob
  
[ActiveJob] GenerateAvatarVideoJob
  D-ID talk created: {id: "tlk-...", status: "created"}
  Avatar video generated successfully for session 1
```

**Başarısız olursa:**
- D-ID API key eksik → Environment variable kontrolü
- Video timeout → İnternet bağlantısı kontrolü
- "Unauthorized" → API token hatalı

#### Test 3: Yerel Mod (Fallback) ✅

1. **"Backend Kullan"** switch'ini **KAPALI** yapın
2. **"🔄 Yeni Metin"** butonuna basın
3. **Beklenen**: Yerel metinlerden biri seçilir
4. **"▶️ Oynat"** butonuna basın
5. **Beklenen**: Direkt D-ID API çağrısı yapılır (eski yöntem)

## 📊 Veritabanı Kontrolü

Backend'de kaydedilen verileri kontrol edin:

```bash
cd voice_ai_api
rails console
```

```ruby
# Toplam session sayısı
AvatarSession.count

# Son oluşturulan session
session = AvatarSession.last
session.status          # => "completed"
session.video_url       # => "https://d-id-talks-prod..."
session.practice_text.content  # => "Hello, how are you today?"

# Kullanıcının tüm sessions
User.find_by(email: 'student@example.com').avatar_sessions
```

## 🐛 Yaygın Hatalar ve Çözümleri

### 1. "Backend'den metin alınamadı: Failed to fetch"

**Sebep**: Backend'e bağlanamıyor

**Çözüm**:
```bash
# iOS Simulator
BASE_URL: 'http://localhost:3000/api/v1'

# Android Emulator
BASE_URL: 'http://10.0.2.2:3000/api/v1'

# Fiziksel cihaz (bilgisayar IP'nizi kullanın)
BASE_URL: 'http://192.168.1.100:3000/api/v1'
```

### 2. "Unauthorized"

**Sebep**: API token hatalı

**Çözüm**:
1. `rails console` açın
2. `User.first.api_token_digest` çalıştırın
3. Token'ı `config.ts`'ye yapıştırın

### 3. "Video generation failed"

**Sebep**: D-ID API anahtarı eksik

**Çözüm**:
```bash
$env:D_ID_API_KEY="YmlsaXJiYXR1OThAZ21haWwuY29t:3DEdeaHwp8-wMTw9KzTit"
$env:ELEVEN_LABS_API_KEY="your_key"
rails server -p 3000
```

### 4. "Transcription failed"

**Sebep**: AssemblyAI API anahtarı eksik

**Çözüm**:
```bash
$env:ASSEMBLY_AI_API_KEY="1841b85fc5cf4678a63268cada518727"
rails server -p 3000
```

## ✅ Başarı Kriterleri

Tüm testler başarılı ise:

- [x] Backend'den metin çekiliyor
- [x] Video backend'de oluşturuluyor
- [x] Session veritabanına kaydediliyor
- [x] Video URL döndürülüyor
- [x] Mobil uygulamada video oynatılıyor
- [x] Console log'lar temiz
- [x] Backend log'lar normal
- [x] Veritabanında kayıt var

## 🎯 Sonraki Adımlar

1. **Ses kaydı backend entegrasyonu**
   - Recording upload API
   - AssemblyAI transcription
   - TranscriptComparison kaydetme

2. **Kullanıcı girişi**
   - Login/signup ekranları
   - Token yönetimi
   - AsyncStorage ile token saklama

3. **İstatistikler ekranı**
   - Geçmiş sessions
   - Benzerlik skorları
   - İlerleme grafikleri

## 📞 Destek

Sorun yaşarsanız:

1. Backend log'larını kontrol edin (`rails server` terminal)
2. Mobil console log'larını kontrol edin
3. `BACKEND_SETUP.md` dosyasına bakın
4. `voice_ai_api/README_API.md` API dökümantasyonunu inceleyin

## 🎉 Başarılı Test Örneği

```bash
# Terminal 1: Backend
$ rails server -p 3000
=> Booting Puma
=> Rails 8.0.4 application starting
* Listening on http://localhost:3000

# Terminal 2: Mobil App
$ npm start
› Press a │ open Android
› Press i │ open iOS simulator

# Mobil Console:
[LOG] Backend'den metin yükleniyor...
[LOG] Backend'den metin alındı: {id: 5, content: "Let's practice English together."}
[LOG] Backend üzerinden avatar videosu oluşturuluyor...
[LOG] Avatar session oluşturuldu: 12
[LOG] Video oluşturma başladı, bekleniyor...
[LOG] Video hazır: https://d-id-talks-prod.s3.us-west-2.amazonaws.com/...

# Backend Console:
Started POST "/api/v1/avatar_sessions" for 127.0.0.1
Processing by Api::V1::AvatarSessionsController#create
  AvatarSession Create (0.6ms)
  Enqueued GenerateAvatarVideoJob (Job ID: xxx)
Completed 201 Created

[ActiveJob] Performing GenerateAvatarVideoJob
  D-ID API: Creating talk...
  D-ID API: Talk created (id: tlk-xxx)
  D-ID API: Waiting for completion...
  D-ID API: Status - processing
  D-ID API: Status - done
  Avatar video generated successfully for session 12
[ActiveJob] GenerateAvatarVideoJob completed
```

✅ **Mükemmel! Her şey çalışıyor!**

