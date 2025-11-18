# ⚡ Postman - 2 Dakikada Başlangıç

## 🎯 3 Basit Adım

### 1️⃣ Import Collection (30 saniye)
1. Postman'i aç
2. **Import** → **File** → `Voice_AI_API.postman_collection.json`
3. ✅ 21 endpoint yüklendi!

### 2️⃣ API Token Ayarla (1 dakika)
```bash
cd voice_ai_api
rails console
```
```ruby
User.first.api_token_digest
# => "877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b"
```

Postman'de:
1. Collection'a sağ tık → **Edit**
2. **Variables** tab
3. `api_token` = `PASTE_TOKEN_HERE`
4. **Save**

### 3️⃣ Test Et (30 saniye)
1. **Health Check** request'i çalıştır → ✅ 200 OK
2. **Get Random Practice Text** → ✅ JSON response
3. **Get Current User** → ✅ User bilgileri

---

## 🚀 İlk API Çağrıları

### Test 1: Backend Çalışıyor mu?
```
GET http://localhost:3000/up
```
✅ Response: `200 OK`

### Test 2: Rastgele Metin Al
```
GET {{base_url}}/practice_texts/random?language=en
```
✅ Response:
```json
{
  "id": 5,
  "content": "Let's practice English together.",
  "difficulty": "beginner"
}
```

### Test 3: Kullanıcı Bilgisi
```
GET {{base_url}}/me
Authorization: Bearer {{api_token}}
```
✅ Response:
```json
{
  "id": 1,
  "email": "student@example.com",
  "role": "student",
  "credits_remaining": 300
}
```

---

## 📱 Tam Akış Test (5 dakika)

### Senaryo: Metin → Video → Ses → Transkript

```
1. GET /practice_texts/random           → Text alındı (ID: 5)
2. POST /avatar_sessions                → Session oluşturuldu (ID: 12)
3. POST /avatar_sessions/12/generate    → Video başladı
4. [30 saniye bekle]
5. GET /avatar_sessions/12              → Video URL geldi ✅
6. POST /recordings                     → Kayıt yüklendi (ID: 8)
7. POST /recordings/8/transcribe        → Transkript başladı
8. [60 saniye bekle]
9. GET /recordings/8                    → Skor geldi: 95% ✅
```

---

## 🔥 Popüler Request'ler

| Request | Method | Auth | Açıklama |
|---------|--------|------|----------|
| Get Random Text | GET | ❌ No | En çok kullanılan |
| Generate Video | POST | ✅ Yes | Background job |
| Transcribe | POST | ✅ Yes | Background job |
| Get Current User | GET | ✅ Yes | Kredi kontrolü |

---

## 📁 Collection İçeriği

```
Voice AI API - Complete Collection
├── Practice Texts (6)
│   ├── Get Random ⭐
│   ├── List All
│   ├── Get by ID
│   ├── Create
│   ├── Update
│   └── Delete
├── Avatar Sessions (5)
│   ├── List My Sessions
│   ├── Get by ID
│   ├── Create
│   ├── Generate Video ⭐
│   └── Update
├── Recordings (3)
│   ├── Create
│   ├── Get by ID
│   └── Transcribe ⭐
├── Transcript Comparisons (2)
│   ├── List
│   └── Get by ID
├── Users (2)
│   ├── Get Me ⭐
│   └── Get by ID
└── Health Check (1)
    └── /up ⭐
```

**Toplam: 21 Request**

---

## 🎨 Request Body Örnekleri

### Create Avatar Session
```json
{
  "avatar_session": {
    "practice_text_id": 1
  }
}
```

### Create Recording
```json
{
  "recording": {
    "storage_url": "https://storage.com/audio.m4a",
    "duration_ms": 5000,
    "avatar_session_id": 12
  }
}
```

### Create Practice Text
```json
{
  "practice_text": {
    "content": "The quick brown fox jumps over the lazy dog.",
    "difficulty": "intermediate",
    "language": "en",
    "active": true
  }
}
```

---

## ⚠️ Önemli Notlar

1. **Background Jobs:** Video ve transkript işlemleri 20-60 saniye sürer
2. **Polling:** Job tamamlanana kadar GET request'i ile kontrol edin
3. **Authentication:** Token her request'te `Authorization: Bearer` ile gönderilmeli
4. **Credits:** Her transkript işlemi kullanıcı kredilerini düşürür

---

## 🐛 Hata Çözümleri

| Hata | Çözüm |
|------|-------|
| Connection refused | `rails server -p 3000` çalıştır |
| 401 Unauthorized | API token'ı güncelle |
| 404 Not Found | ID'yi kontrol et |
| 422 Unprocessable | Request body'yi kontrol et |

---

## 📚 Detaylı Dökümantasyon

- **Postman Rehberi**: `POSTMAN_GUIDE.md` (tam detay)
- **API Dökümantasyonu**: `README_API.md`
- **Test Senaryoları**: `../VoiceAIApp/TEST_GUIDE.md`

---

## ✅ Başarı Kontrolü

- [x] Collection import edildi
- [x] API token ayarlandı
- [x] Health check başarılı (200 OK)
- [x] Rastgele metin çekildi
- [x] Authentication çalıştı
- [x] Avatar session oluşturuldu

**Hepsi tamamsa hazırsınız!** 🎉

---

## 🚀 Sonraki Adım

1. **Collection Runner** kullanarak tüm endpoint'leri test edin
2. **Environment** oluşturup production için ayrı token ayarlayın
3. **Test Scripts** ekleyerek otomatik testler yazın

**İyi testler!** 🎯

