# 🚀 Voice AI Backend - Kurulum ve Kullanım Rehberi

## ✅ Tamamlanan İşlemler

### 1. Ruby & Rails Kurulumu
- ✅ Ruby 3.3.10 kuruldu
- ✅ Rails 8.0.4 kuruldu
- ✅ SQLite3 veritabanı yapılandırıldı

### 2. Veritabanı Modelleri (5 Model)

#### User
- Email, role (student/admin), API token, kredi takibi
- İlişkiler: has_many avatar_sessions, recordings

#### PracticeText
- İngilizce pratik cümleleri
- Zorluk seviyesi (beginner, intermediate, advanced)
- Dil desteği (en, tr, es, fr, de)
- İlişkiler: has_many avatar_sessions

#### AvatarSession
- Kullanıcı + metin + D-ID video URL
- Durum: pending, processing, completed, failed
- İlişkiler: belongs_to user, practice_text

#### Recording
- Ses kaydı meta verileri
- Storage URL, süre, waveform
- İlişkiler: belongs_to user, avatar_session (optional)

#### TranscriptComparison
- AssemblyAI transkripti + referans metin karşılaştırma
- Benzerlik skoru (0-100%)
- Yanlış/eksik kelimeler
- İlişkiler: belongs_to avatar_session, recording

### 3. API Endpoint'leri

```
GET    /api/v1/practice_texts          - Tüm metinleri listele
GET    /api/v1/practice_texts/random   - Rastgele metin
GET    /api/v1/practice_texts/:id      - Metin detayı
POST   /api/v1/practice_texts          - Yeni metin oluştur (auth)
PUT    /api/v1/practice_texts/:id      - Metin güncelle (auth)
DELETE /api/v1/practice_texts/:id      - Metin sil (auth)

GET    /api/v1/avatar_sessions         - Kullanıcı oturumları (auth)
GET    /api/v1/avatar_sessions/:id     - Oturum detayı (auth)
POST   /api/v1/avatar_sessions         - Yeni oturum (auth)
POST   /api/v1/avatar_sessions/:id/generate_video - Video oluştur (auth)

POST   /api/v1/recordings              - Kayıt yükle (auth)
GET    /api/v1/recordings/:id          - Kayıt detayı (auth)
POST   /api/v1/recordings/:id/transcribe - Transkript oluştur (auth)

GET    /api/v1/transcript_comparisons  - Karşılaştırmalar (auth)
GET    /api/v1/transcript_comparisons/:id - Karşılaştırma detayı (auth)

GET    /api/v1/me                      - Mevcut kullanıcı bilgisi (auth)
GET    /api/v1/users/:id               - Kullanıcı detayı (auth)
```

### 4. Servisler

#### DIdService (`app/services/d_id_service.rb`)
- D-ID API entegrasyonu
- Avatar video oluşturma
- ElevenLabs ses sentezi

#### AssemblyAIService (`app/services/assembly_ai_service.rb`)
- AssemblyAI STT entegrasyonu
- Ses dosyası transkripti
- Polling mekanizması

### 5. Background Jobs

#### GenerateAvatarVideoJob
- D-ID ile avatar videosu oluşturur
- Async işlem (Solid Queue)
- Session status güncelleme

#### TranscribeAudioJob
- AssemblyAI ile ses transkripti
- TranscriptComparison oluşturur
- Kullanıcı kredilerini düşer

## 🎯 Hızlı Başlangıç

### 1. Sunucuyu Başlat

```bash
cd voice_ai_api
rails server -p 3000
```

Sunucu `http://localhost:3000` adresinde çalışacak.

### 2. Test Kullanıcıları

Seed data ile oluşturulan kullanıcılar:

**Admin:**
- Email: `admin@voiceai.com`
- API Token: (seed çıktısında gösterildi)
- Kredi: 1000 dakika

**Öğrenci:**
- Email: `student@example.com`
- API Token: (seed çıktısında gösterildi)
- Kredi: 300 dakika (5 saat)

### 3. API Test Örnekleri

#### Rastgele Pratik Metni Al
```bash
curl http://localhost:3000/api/v1/practice_texts/random?language=en
```

Çıktı:
```json
{
  "id": 1,
  "content": "Hello, how are you today?",
  "difficulty": "beginner",
  "language": "en",
  "active": true
}
```

#### Kullanıcı Bilgisi Al
```bash
curl http://localhost:3000/api/v1/me \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

#### Avatar Session Oluştur
```bash
curl -X POST http://localhost:3000/api/v1/avatar_sessions \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_session": {
      "practice_text_id": 1
    }
  }'
```

#### Video Oluştur (Background Job)
```bash
curl -X POST http://localhost:3000/api/v1/avatar_sessions/1/generate_video \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Response:
```json
{
  "message": "Video generation started",
  "session": {
    "id": 1,
    "status": "processing",
    "video_url": null
  }
}
```

#### Ses Kaydı Yükle
```bash
curl -X POST http://localhost:3000/api/v1/recordings \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recording": {
      "storage_url": "https://your-storage.com/audio.m4a",
      "duration_ms": 5000,
      "avatar_session_id": 1
    }
  }'
```

#### Transkript Oluştur (Background Job)
```bash
curl -X POST http://localhost:3000/api/v1/recordings/1/transcribe \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## 🔧 Environment Variables

API anahtarlarını ortam değişkeni olarak ayarlayın:

### Windows (PowerShell)
```powershell
$env:D_ID_API_KEY="your_d_id_api_key"
$env:ELEVEN_LABS_API_KEY="your_eleven_labs_key"
$env:ASSEMBLY_AI_API_KEY="your_assembly_ai_key"
```

### Linux/Mac
```bash
export D_ID_API_KEY="your_d_id_api_key"
export ELEVEN_LABS_API_KEY="your_eleven_labs_key"
export ASSEMBLY_AI_API_KEY="your_assembly_ai_key"
```

## 📱 Mobil Uygulama Entegrasyonu

### 1. API URL'ini Ayarla

`VoiceAIApp/config.ts` (yeni dosya):
```typescript
export const API_URL = 'http://localhost:3000/api/v1';
export const API_TOKEN = 'user_api_token_here';
```

### 2. API Service Oluştur

`VoiceAIApp/services/ApiService.ts`:
```typescript
import { API_URL, API_TOKEN } from '../config';

export class ApiService {
  private static headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  static async getRandomText(language = 'en', difficulty?: string) {
    let url = `${API_URL}/practice_texts/random?language=${language}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    
    const response = await fetch(url);
    return response.json();
  }

  static async createAvatarSession(practiceTextId: number) {
    const response = await fetch(`${API_URL}/avatar_sessions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        avatar_session: { practice_text_id: practiceTextId }
      })
    });
    return response.json();
  }

  static async generateVideo(sessionId: number) {
    const response = await fetch(
      `${API_URL}/avatar_sessions/${sessionId}/generate_video`,
      {
        method: 'POST',
        headers: this.headers
      }
    );
    return response.json();
  }

  static async uploadRecording(data: {
    storage_url: string;
    duration_ms: number;
    avatar_session_id?: number;
  }) {
    const response = await fetch(`${API_URL}/recordings`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ recording: data })
    });
    return response.json();
  }

  static async transcribeRecording(recordingId: number) {
    const response = await fetch(
      `${API_URL}/recordings/${recordingId}/transcribe`,
      {
        method: 'POST',
        headers: this.headers
      }
    );
    return response.json();
  }

  static async getComparisons() {
    const response = await fetch(`${API_URL}/transcript_comparisons`, {
      headers: this.headers
    });
    return response.json();
  }
}
```

### 3. App.tsx'te Kullan

```typescript
import { ApiService } from './services/ApiService';

// Rastgele metin al
const loadRandomText = async () => {
  try {
    const text = await ApiService.getRandomText('en', 'beginner');
    setAvatarText(text.content);
  } catch (error) {
    console.error('API Error:', error);
  }
};

// Avatar videosu oluştur
const generateAvatarVideo = async () => {
  try {
    // 1. Session oluştur
    const session = await ApiService.createAvatarSession(practiceTextId);
    
    // 2. Video oluştur (background job)
    const result = await ApiService.generateVideo(session.id);
    
    // 3. Polling ile video URL'ini bekle
    pollForVideoUrl(session.id);
  } catch (error) {
    console.error('Video generation error:', error);
  }
};
```

## 🎨 Önerilen İyileştirmeler

### 1. Kimlik Doğrulama Sistemi
- JWT token yerine session-based auth
- Kullanıcı kayıt/giriş endpoint'leri
- Password hashing (bcrypt)

### 2. Rate Limiting
- API rate limiting (rack-attack gem)
- Kullanıcı başına istek limiti

### 3. Caching
- Redis ile API response caching
- Practice texts için cache

### 4. WebSocket Support
- Action Cable ile real-time updates
- Video/transkript durumu için live bildirim

### 5. File Upload
- Active Storage ile direkt dosya upload
- S3/CloudFlare R2 entegrasyonu

### 6. Admin Panel
- ActiveAdmin veya Avo kurulumu
- Model yönetimi için admin UI

## 📊 Veritabanı Durumu

```bash
rails console
```

```ruby
# İstatistikler
User.count              # => 2
PracticeText.count      # => 15
AvatarSession.count     # => 1

# Test kullanıcısı
user = User.find_by(email: 'student@example.com')
user.api_token_digest   # API token
user.credits_remaining  # Kalan kredi
user.avatar_sessions    # Oturumlar

# Rastgele metin
PracticeText.active.by_language('en').sample
```

## 🐛 Hata Ayıklama

### Log Dosyaları
```bash
tail -f log/development.log
```

### Console Test
```bash
rails console

# Service test
service = DIdService.new(api_key: ENV['D_ID_API_KEY'])
service.create_talk(text: "Test")

# Model test
user = User.first
session = user.avatar_sessions.create!(
  practice_text: PracticeText.first
)
```

## 📦 Production Checklist

- [ ] PostgreSQL'e geçiş (SQLite yerine)
- [ ] Environment variables ayarla
- [ ] CORS origins'i production domain'e güncelle
- [ ] SSL/HTTPS zorunlu yap
- [ ] Rate limiting ekle
- [ ] Monitoring (Sentry/Rollbar)
- [ ] Background job queue (Sidekiq/GoodJob)
- [ ] CDN için asset precompile
- [ ] Database backup stratejisi
- [ ] API versioning stratejisi

## 🎉 Sonuç

Backend tamamen hazır! Mobil uygulamanızı bu API'ye bağlayabilir ve:

1. ✅ Metinleri backend'den çekebilirsiniz
2. ✅ D-ID videolarını backend'de oluşturabilirsiniz
3. ✅ AssemblyAI transkriptlerini backend'de işleyebilirsiniz
4. ✅ Kullanıcı kredilerini takip edebilirsiniz
5. ✅ Tüm geçmişi veritabanında saklayabilirsiniz

**API Sunucusu Çalışıyor:** `http://localhost:3000`

Sorularınız için README_API.md dosyasına bakın! 🚀

