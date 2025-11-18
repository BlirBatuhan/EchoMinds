# 📮 Postman Collection - Kullanım Rehberi

## 🎯 Hızlı Başlangıç

### 1. Collection'ı İçe Aktar

1. Postman'i açın
2. **Import** butonuna tıklayın
3. **File** sekmesinde `Voice_AI_API.postman_collection.json` dosyasını seçin
4. **Import** butonuna basın

✅ Tüm API endpoint'leri otomatik yüklenecek!

---

### 2. Environment Variables Ayarlama

#### Yöntem A: Collection Variables (Önerilen)

1. Collection'a sağ tıklayın → **Edit**
2. **Variables** sekmesine gidin
3. `api_token` değişkenini güncelleyin:

```bash
# Terminal'de API token alın
cd voice_ai_api
rails console
User.first.api_token_digest
```

Kopyalanan token'ı yapıştırın:
```
api_token = 877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b
```

4. **Save** butonuna basın

#### Yöntem B: Environment Oluşturma

1. **Environments** → **+** (New Environment)
2. İsim: `Voice AI - Local`
3. Variables:
   - `base_url` = `http://localhost:3000/api/v1`
   - `api_token` = `YOUR_TOKEN_HERE`
4. **Save**
5. Sağ üstten environment'ı seçin

---

## 📡 API Endpoint'leri (21 Request)

### Practice Texts (6 endpoint)
- ✅ GET Random Practice Text - *Auth: No*
- ✅ GET List All Practice Texts - *Auth: No*
- ✅ GET Practice Text by ID - *Auth: No*
- 🔐 POST Create Practice Text - *Auth: Yes*
- 🔐 PUT Update Practice Text - *Auth: Yes*
- 🔐 DELETE Delete Practice Text - *Auth: Yes*

### Avatar Sessions (5 endpoint)
- 🔐 GET List My Avatar Sessions - *Auth: Yes*
- 🔐 GET Avatar Session by ID - *Auth: Yes*
- 🔐 POST Create Avatar Session - *Auth: Yes*
- 🔐 POST Generate Avatar Video - *Auth: Yes* ⭐
- 🔐 PUT Update Avatar Session - *Auth: Yes*

### Recordings (3 endpoint)
- 🔐 POST Create Recording - *Auth: Yes*
- 🔐 GET Recording by ID - *Auth: Yes*
- 🔐 POST Transcribe Recording - *Auth: Yes* ⭐

### Transcript Comparisons (2 endpoint)
- 🔐 GET List My Comparisons - *Auth: Yes*
- 🔐 GET Comparison by ID - *Auth: Yes*

### Users (2 endpoint)
- 🔐 GET Current User (me) - *Auth: Yes*
- 🔐 GET User by ID - *Auth: Yes*

### Health Check (1 endpoint)
- ✅ GET Health Check - *Auth: No*

---

## 🎬 Kullanım Senaryoları

### Senaryo 1: Rastgele Metin Al ve Video Oluştur

#### Adım 1: Rastgele Metin Çek
```
GET /api/v1/practice_texts/random?language=en&difficulty=beginner
```

**Response:**
```json
{
  "id": 5,
  "content": "Let's practice English together.",
  "difficulty": "beginner",
  "language": "en",
  "active": true
}
```

#### Adım 2: Avatar Session Oluştur
```
POST /api/v1/avatar_sessions
Authorization: Bearer YOUR_TOKEN

Body:
{
  "avatar_session": {
    "practice_text_id": 5
  }
}
```

**Response:**
```json
{
  "id": 12,
  "user_id": 1,
  "practice_text_id": 5,
  "status": "pending",
  "video_url": null,
  "created_at": "2025-11-18T19:30:00Z"
}
```

#### Adım 3: Video Oluştur
```
POST /api/v1/avatar_sessions/12/generate_video
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "Video generation started",
  "session": {
    "id": 12,
    "status": "processing"
  }
}
```

#### Adım 4: Polling (20-30 saniye)
```
GET /api/v1/avatar_sessions/12
Authorization: Bearer YOUR_TOKEN
```

**Response (tamamlandığında):**
```json
{
  "id": 12,
  "status": "completed",
  "video_url": "https://d-id-talks-prod.s3.amazonaws.com/...",
  "practice_text": {
    "content": "Let's practice English together."
  }
}
```

---

### Senaryo 2: Ses Kaydı Yükle ve Transkript Et

#### Adım 1: Ses Kaydı Oluştur
```
POST /api/v1/recordings
Authorization: Bearer YOUR_TOKEN

Body:
{
  "recording": {
    "storage_url": "https://your-storage.com/recording.m4a",
    "duration_ms": 5000,
    "avatar_session_id": 12
  }
}
```

**Response:**
```json
{
  "id": 8,
  "user_id": 1,
  "avatar_session_id": 12,
  "storage_url": "https://your-storage.com/recording.m4a",
  "duration_ms": 5000
}
```

#### Adım 2: Transkript Başlat
```
POST /api/v1/recordings/8/transcribe
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "message": "Transcription started",
  "recording": {
    "id": 8
  }
}
```

#### Adım 3: Polling (30-60 saniye)
```
GET /api/v1/recordings/8
Authorization: Bearer YOUR_TOKEN
```

**Response (tamamlandığında):**
```json
{
  "id": 8,
  "storage_url": "...",
  "transcript_comparison": {
    "id": 5,
    "reference_text": "Let's practice English together.",
    "transcript_text": "Let's practice English together",
    "similarity_score": 95,
    "mismatched_words": {
      "missing": ["."],
      "extra": []
    }
  }
}
```

---

## 🧪 Test Senaryoları

### Test 1: Backend Çalışıyor mu?
```
GET http://localhost:3000/up
```
✅ Response: 200 OK

### Test 2: Authentication Çalışıyor mu?
```
GET /api/v1/me
Authorization: Bearer YOUR_TOKEN
```
✅ Response: User bilgileri
❌ Response 401: Token hatalı

### Test 3: Pratik Metin Çekme
```
GET /api/v1/practice_texts/random?language=en
```
✅ Response: Rastgele metin
❌ Response 404: Metin bulunamadı

---

## 🔐 Authentication

### Bearer Token Format
```
Authorization: Bearer 877780775d2938d71a891dfbd1455f7aa6d7270949c7815334253507a479d43b
```

### Token Nereden Alınır?

#### Rails Console:
```bash
cd voice_ai_api
rails console
```

```ruby
# Tüm kullanıcılar
User.all.each { |u| puts "#{u.email}: #{u.api_token_digest}" }

# Belirli kullanıcı
User.find_by(email: 'student@example.com').api_token_digest
```

#### Seed Data:
Seed çalıştırıldığında console'da görünür:
```bash
rails db:seed
```

```
🔑 Test Credentials:
   Student: student@example.com (API Token: 877780...)
```

---

## 📊 Response Formats

### Success Response (200/201)
```json
{
  "id": 1,
  "field": "value",
  "created_at": "2025-11-18T19:30:00Z"
}
```

### Error Response (400/422)
```json
{
  "errors": [
    "Content can't be blank",
    "Difficulty must be included in the list"
  ]
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "error": "Record not found"
}
```

---

## 🎨 Postman Features

### Pre-request Script Örneği
```javascript
// Timestamp ekle
pm.environment.set("timestamp", Date.now());

// Random ID
pm.environment.set("random_id", Math.floor(Math.random() * 100));
```

### Test Script Örneği
```javascript
// Status code kontrolü
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Response time kontrolü
pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// JSON structure kontrolü
pm.test("Has id field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});

// Session ID kaydet
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("last_session_id", jsonData.id);
}
```

---

## 🚀 Otomatik Test Runner

### Collection Runner Kullanımı

1. Collection'a sağ tıklayın → **Run**
2. Çalıştırılacak request'leri seçin
3. **Run Voice AI API** butonuna basın
4. Tüm testler otomatik çalışır

### Önerilen Test Sırası
1. Health Check
2. Get Random Practice Text
3. Get Current User
4. Create Avatar Session
5. Generate Avatar Video
6. (Bekleme - 30 saniye)
7. Get Avatar Session
8. Create Recording
9. Transcribe Recording
10. (Bekleme - 60 saniye)
11. Get Recording
12. Get Transcript Comparisons

---

## 📝 Environment Değişkenleri

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000/api/v1` |
| `api_token` | Bearer token | `877780775d2938d71a8...` |
| `last_session_id` | Son session ID (script ile kaydedilir) | `12` |
| `last_recording_id` | Son recording ID | `8` |

---

## 🐛 Troubleshooting

### "Could not get any response"
- Backend çalışıyor mu? → `rails server -p 3000`
- URL doğru mu? → `http://localhost:3000`

### "401 Unauthorized"
- API token doğru mu? → `rails console` ile kontrol
- Collection variables güncel mi? → Edit → Variables

### "404 Not Found"
- ID doğru mu? → Mevcut bir ID kullanın
- Endpoint doğru mu? → `/api/v1/` prefix'i kontrol

### "422 Unprocessable Entity"
- Request body doğru mu? → JSON formatı kontrol
- Required field'lar eksik mi? → Body örneğine bakın

---

## 📚 Daha Fazla Bilgi

- **API Dökümantasyonu**: `voice_ai_api/README_API.md`
- **Model Diyagramları**: `voice_ai_api/MODEL_DIAGRAMS.md`
- **Test Rehberi**: `VoiceAIApp/TEST_GUIDE.md`

---

## ✅ Checklist

- [ ] Postman'e collection import edildi
- [ ] API token alındı ve ayarlandı
- [ ] Backend sunucusu çalışıyor
- [ ] Health check başarılı
- [ ] Rastgele metin çekme test edildi
- [ ] Authentication test edildi
- [ ] Avatar session oluşturma test edildi
- [ ] Video generation test edildi

Tüm checkler tamamsa hazırsınız! 🎉

