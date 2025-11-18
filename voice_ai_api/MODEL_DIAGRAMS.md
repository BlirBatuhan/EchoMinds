# 📊 Voice AI - Model Diyagramları

## 🎯 5 Model İlişkileri

### Entity Relationship Diagram (yUML)

```
[User|id:integer;email:string;role:enum;api_token_digest:string;credits_remaining:integer]
[PracticeText|id:integer;content:text;difficulty:enum;language:string;tags:json;active:boolean]
[AvatarSession|id:integer;user_id:integer;practice_text_id:integer;status:enum;video_url:string;d_id_job_id:string]
[Recording|id:integer;user_id:integer;avatar_session_id:integer;storage_url:string;duration_ms:integer;waveform:json]
[TranscriptComparison|id:integer;avatar_session_id:integer;recording_id:integer;reference_text:text;transcript_text:text;similarity_score:integer;mismatched_words:json]

[User]1-*[AvatarSession]
[User]1-*[Recording]
[PracticeText]1-*[AvatarSession]
[AvatarSession]1-*[Recording]
[AvatarSession]1-1[TranscriptComparison]
[Recording]1-1[TranscriptComparison]
```

### yUML Online Link

Bu kodu şu sitelerde görselleştirebilirsiniz:
- https://yuml.me/diagram/scruffy/class/draw
- http://www.nomnoml.com/

---

## 📐 Detaylı Model Diyagramları

### 1. User Model

```
[User|
  +id: integer
  +email: string {unique}
  +role: enum {student, admin}
  +api_token_digest: string
  +credits_remaining: integer
  +created_at: datetime
  +updated_at: datetime
  |
  +has_many avatar_sessions
  +has_many recordings
]
```

**Enums:**
- `role`: student (0), admin (1)

**Validations:**
- email: presence, uniqueness, format
- role: presence
- credits_remaining: >= 0

---

### 2. PracticeText Model

```
[PracticeText|
  +id: integer
  +content: text
  +difficulty: enum
  +language: string
  +tags: json
  +active: boolean
  +created_at: datetime
  +updated_at: datetime
  |
  +has_many avatar_sessions
]
```

**Enums:**
- `difficulty`: beginner (0), intermediate (1), advanced (2)

**Validations:**
- content: presence, length (5-500)
- difficulty: presence
- language: presence, inclusion in [en, tr, es, fr, de]

**Scopes:**
- `active` - aktif metinler
- `by_language(lang)` - dile göre filtre
- `by_difficulty(diff)` - zorluk seviyesine göre

---

### 3. AvatarSession Model

```
[AvatarSession|
  +id: integer
  +user_id: integer {foreign_key}
  +practice_text_id: integer {foreign_key}
  +status: enum
  +video_url: string
  +d_id_job_id: string
  +created_at: datetime
  +updated_at: datetime
  |
  +belongs_to user
  +belongs_to practice_text
  +has_many recordings
  +has_one transcript_comparison
]
```

**Enums:**
- `status`: pending (0), processing (1), completed (2), failed (3)

**Validations:**
- status: presence
- video_url: URL format (optional)

**Scopes:**
- `recent` - created_at DESC
- `by_status(stat)` - duruma göre

---

### 4. Recording Model

```
[Recording|
  +id: integer
  +user_id: integer {foreign_key}
  +avatar_session_id: integer {foreign_key, optional}
  +storage_url: string
  +duration_ms: integer
  +waveform: json
  +created_at: datetime
  +updated_at: datetime
  |
  +belongs_to user
  +belongs_to avatar_session {optional}
  +has_one transcript_comparison
]
```

**Validations:**
- storage_url: presence, URL format
- duration_ms: > 0 (optional)

**Scopes:**
- `recent` - created_at DESC
- `for_session(id)` - session'a göre

---

### 5. TranscriptComparison Model

```
[TranscriptComparison|
  +id: integer
  +avatar_session_id: integer {foreign_key}
  +recording_id: integer {foreign_key}
  +reference_text: text
  +transcript_text: text
  +similarity_score: integer
  +mismatched_words: json
  +created_at: datetime
  +updated_at: datetime
  |
  +belongs_to avatar_session
  +belongs_to recording
  |
  +calculate_similarity()
  +normalize_text(text)
]
```

**Validations:**
- reference_text: presence
- transcript_text: presence
- similarity_score: 0-100 (optional)

**Callbacks:**
- `before_save :calculate_similarity` - otomatik skor hesaplama

**JSON Fields:**
- `mismatched_words`:
  ```json
  {
    "missing": ["word1", "word2"],
    "extra": ["word3", "word4"]
  }
  ```

---

## 🔗 İlişki Özeti

### Has Many İlişkiler
```
User ──────< AvatarSession
User ──────< Recording
PracticeText ──────< AvatarSession
AvatarSession ──────< Recording
```

### Has One İlişkiler
```
AvatarSession ────── TranscriptComparison
Recording ────── TranscriptComparison
```

### Belongs To İlişkiler
```
AvatarSession >────── User
AvatarSession >────── PracticeText
Recording >────── User
Recording >────── AvatarSession (optional)
TranscriptComparison >────── AvatarSession
TranscriptComparison >────── Recording
```

---

## 📊 Cascade Delete Davranışları

```
User (silme)
  └─> AvatarSession (dependent: :destroy)
        └─> Recording (dependent: :destroy)
              └─> TranscriptComparison (dependent: :destroy)
        └─> TranscriptComparison (dependent: :destroy)
  └─> Recording (dependent: :destroy)
        └─> TranscriptComparison (dependent: :destroy)

PracticeText (silme)
  └─> AvatarSession (dependent: :destroy)
        └─> ... (yukarıdaki gibi)
```

---

## 🎨 Class Diagram (Simplified yUML)

```
// Basitleştirilmiş format
[User]1-has many-*[AvatarSession]
[User]1-has many-*[Recording]
[PracticeText]1-has many-*[AvatarSession]
[AvatarSession]1-has many-*[Recording]
[AvatarSession]1-has one-1[TranscriptComparison]
[Recording]1-has one-1[TranscriptComparison]

[AvatarSession]-belongs to-[User]
[AvatarSession]-belongs to-[PracticeText]
[Recording]-belongs to-[User]
[Recording]-belongs to (optional)-[AvatarSession]
[TranscriptComparison]-belongs to-[AvatarSession]
[TranscriptComparison]-belongs to-[Recording]
```

---

## 🌐 Görselleştirme

### Adım 1: yUML.me kullanarak

1. https://yuml.me/diagram/scruffy/class/draw adresine gidin
2. Aşağıdaki kodu yapıştırın:

```
[User]1-*[AvatarSession]
[User]1-*[Recording]
[PracticeText]1-*[AvatarSession]
[AvatarSession]1-*[Recording]
[AvatarSession]1-1[TranscriptComparison]
[Recording]1-1[TranscriptComparison]
```

3. "Create" butonuna basın
4. PNG olarak kaydedin

### Adım 2: Nomnoml kullanarak

http://www.nomnoml.com/ adresine gidin ve yapıştırın:

```
[User|
  email: string
  role: enum
  api_token: string
  credits: integer
]

[PracticeText|
  content: text
  difficulty: enum
  language: string
  active: boolean
]

[AvatarSession|
  status: enum
  video_url: string
  d_id_job_id: string
]

[Recording|
  storage_url: string
  duration_ms: integer
  waveform: json
]

[TranscriptComparison|
  reference_text: text
  transcript_text: text
  similarity_score: integer
  mismatched_words: json
]

[User] 1 -> * [AvatarSession]
[User] 1 -> * [Recording]
[PracticeText] 1 -> * [AvatarSession]
[AvatarSession] 1 -> * [Recording]
[AvatarSession] 1 -> 1 [TranscriptComparison]
[Recording] 1 -> 1 [TranscriptComparison]
```

---

## 📈 Veritabanı İstatistikleri

```ruby
# Rails console
User.count                    # 2 users
PracticeText.count            # 15 texts
AvatarSession.count           # X sessions
Recording.count               # X recordings
TranscriptComparison.count    # X comparisons

# İlişki kontrol
user = User.first
user.avatar_sessions.count
user.recordings.count

session = AvatarSession.first
session.user
session.practice_text
session.recordings
session.transcript_comparison
```

---

## 🔍 Örnek Sorgu Akışı

### Video Oluşturma ve Kayıt
```
1. User seçer -> PracticeText
2. AvatarSession oluşturulur
3. GenerateAvatarVideoJob çalışır
4. video_url kaydedilir (status: completed)
5. Kullanıcı ses kaydı yapar
6. Recording oluşturulur
7. TranscribeAudioJob çalışır
8. TranscriptComparison oluşturulur
9. similarity_score hesaplanır
```

### SQL Sorgu Örneği
```sql
-- Kullanıcının tüm sessions ve skorları
SELECT 
  u.email,
  pt.content,
  as.status,
  tc.similarity_score
FROM users u
JOIN avatar_sessions as ON as.user_id = u.id
JOIN practice_texts pt ON as.practice_text_id = pt.id
LEFT JOIN transcript_comparisons tc ON tc.avatar_session_id = as.id
WHERE u.id = 1
ORDER BY as.created_at DESC;
```

---

## ✅ Model Sayısı: **5**

1. **User** - Kullanıcı yönetimi
2. **PracticeText** - Pratik metinleri
3. **AvatarSession** - Video oturumları
4. **Recording** - Ses kayıtları
5. **TranscriptComparison** - Transkript karşılaştırmaları

Tümü birbirleriyle ilişkili ve cascade delete destekli! 🚀

