# 🎨 Voice AI - Entity Relationship Diagram

## Mermaid ER Diagram (GitHub destekli)

```mermaid
erDiagram
    USER ||--o{ AVATAR_SESSION : creates
    USER ||--o{ RECORDING : makes
    PRACTICE_TEXT ||--o{ AVATAR_SESSION : uses
    AVATAR_SESSION ||--o{ RECORDING : has
    AVATAR_SESSION ||--|| TRANSCRIPT_COMPARISON : generates
    RECORDING ||--|| TRANSCRIPT_COMPARISON : analyzed_in

    USER {
        integer id PK
        string email UK
        enum role
        string api_token_digest
        integer credits_remaining
        datetime created_at
        datetime updated_at
    }

    PRACTICE_TEXT {
        integer id PK
        text content
        enum difficulty
        string language
        json tags
        boolean active
        datetime created_at
        datetime updated_at
    }

    AVATAR_SESSION {
        integer id PK
        integer user_id FK
        integer practice_text_id FK
        enum status
        string video_url
        string d_id_job_id
        datetime created_at
        datetime updated_at
    }

    RECORDING {
        integer id PK
        integer user_id FK
        integer avatar_session_id FK
        string storage_url
        integer duration_ms
        json waveform
        datetime created_at
        datetime updated_at
    }

    TRANSCRIPT_COMPARISON {
        integer id PK
        integer avatar_session_id FK
        integer recording_id FK
        text reference_text
        text transcript_text
        integer similarity_score
        json mismatched_words
        datetime created_at
        datetime updated_at
    }
```

## Class Diagram

```mermaid
classDiagram
    class User {
        +Integer id
        +String email
        +Enum role
        +String api_token_digest
        +Integer credits_remaining
        +has_many avatar_sessions
        +has_many recordings
    }

    class PracticeText {
        +Integer id
        +Text content
        +Enum difficulty
        +String language
        +JSON tags
        +Boolean active
        +has_many avatar_sessions
    }

    class AvatarSession {
        +Integer id
        +Integer user_id
        +Integer practice_text_id
        +Enum status
        +String video_url
        +String d_id_job_id
        +belongs_to user
        +belongs_to practice_text
        +has_many recordings
        +has_one transcript_comparison
    }

    class Recording {
        +Integer id
        +Integer user_id
        +Integer avatar_session_id
        +String storage_url
        +Integer duration_ms
        +JSON waveform
        +belongs_to user
        +belongs_to avatar_session
        +has_one transcript_comparison
    }

    class TranscriptComparison {
        +Integer id
        +Integer avatar_session_id
        +Integer recording_id
        +Text reference_text
        +Text transcript_text
        +Integer similarity_score
        +JSON mismatched_words
        +belongs_to avatar_session
        +belongs_to recording
        +calculate_similarity()
    }

    User "1" --> "many" AvatarSession
    User "1" --> "many" Recording
    PracticeText "1" --> "many" AvatarSession
    AvatarSession "1" --> "many" Recording
    AvatarSession "1" --> "1" TranscriptComparison
    Recording "1" --> "1" TranscriptComparison
```

## Sequence Diagram - Video Oluşturma

```mermaid
sequenceDiagram
    participant Mobile as Mobil App
    participant API as Rails API
    participant Job as Background Job
    participant DID as D-ID API
    participant DB as Database

    Mobile->>API: POST /avatar_sessions (practice_text_id)
    API->>DB: Create AvatarSession (status: pending)
    API-->>Mobile: {session_id, status: pending}
    
    Mobile->>API: POST /avatar_sessions/:id/generate_video
    API->>Job: Enqueue GenerateAvatarVideoJob
    API->>DB: Update status: processing
    API-->>Mobile: {message: "Video generation started"}
    
    Job->>DID: POST /talks (text, voice)
    DID-->>Job: {talk_id}
    
    loop Polling
        Job->>DID: GET /talks/:id
        DID-->>Job: {status: processing}
    end
    
    DID-->>Job: {status: done, result_url}
    Job->>DB: Update AvatarSession (video_url, status: completed)
    
    loop Mobile Polling
        Mobile->>API: GET /avatar_sessions/:id
        API->>DB: Fetch AvatarSession
        DB-->>API: {status, video_url}
        API-->>Mobile: {status, video_url}
    end
    
    Mobile->>Mobile: Play video
```

## Sequence Diagram - Transkript Karşılaştırma

```mermaid
sequenceDiagram
    participant Mobile as Mobil App
    participant API as Rails API
    participant Job as Background Job
    participant ASM as AssemblyAI
    participant DB as Database

    Mobile->>API: POST /recordings (storage_url, avatar_session_id)
    API->>DB: Create Recording
    API-->>Mobile: {recording_id}
    
    Mobile->>API: POST /recordings/:id/transcribe
    API->>Job: Enqueue TranscribeAudioJob
    API-->>Mobile: {message: "Transcription started"}
    
    Job->>ASM: POST /transcript (audio_url)
    ASM-->>Job: {transcript_id}
    
    loop Polling
        Job->>ASM: GET /transcript/:id
        ASM-->>Job: {status: processing}
    end
    
    ASM-->>Job: {status: completed, text}
    
    Job->>DB: Fetch AvatarSession.practice_text.content
    DB-->>Job: reference_text
    
    Job->>Job: Calculate similarity
    
    Job->>DB: Create TranscriptComparison
    Job->>DB: Update User credits
    
    Mobile->>API: GET /recordings/:id
    API->>DB: Fetch Recording with TranscriptComparison
    DB-->>API: {recording, transcript_comparison}
    API-->>Mobile: {similarity_score, mismatched_words}
```

## State Diagram - AvatarSession Status

```mermaid
stateDiagram-v2
    [*] --> pending: Session Created
    pending --> processing: generate_video called
    processing --> completed: Video ready
    processing --> failed: Error occurred
    completed --> [*]
    failed --> [*]
    
    note right of processing
        Background Job
        Polling D-ID API
        20-30 seconds
    end note
    
    note right of completed
        video_url available
        Ready to play
    end note
```

## Database Schema Diagram

```mermaid
graph TB
    subgraph "Authentication & Users"
        U[users table]
    end
    
    subgraph "Practice Content"
        PT[practice_texts table]
    end
    
    subgraph "Avatar Sessions"
        AS[avatar_sessions table]
    end
    
    subgraph "Audio Recordings"
        R[recordings table]
    end
    
    subgraph "Analysis Results"
        TC[transcript_comparisons table]
    end
    
    U -->|has_many| AS
    U -->|has_many| R
    PT -->|has_many| AS
    AS -->|has_many| R
    AS -->|has_one| TC
    R -->|has_one| TC
    
    style U fill:#e1f5ff
    style PT fill:#fff3e0
    style AS fill:#f3e5f5
    style R fill:#e8f5e9
    style TC fill:#fff9c4
```

---

## 📊 Model Özeti

| Model | Amaç | İlişkiler | Enum Fields |
|-------|------|-----------|-------------|
| **User** | Kullanıcı yönetimi | 2 has_many | role |
| **PracticeText** | Pratik cümleleri | 1 has_many | difficulty |
| **AvatarSession** | Video oturumları | 2 belongs_to, 1 has_many, 1 has_one | status |
| **Recording** | Ses kayıtları | 2 belongs_to, 1 has_one | - |
| **TranscriptComparison** | Karşılaştırma sonuçları | 2 belongs_to | - |

**Toplam: 5 Model**

---

## 🔗 GitHub'da Görüntüleme

Bu dosyayı GitHub'a push ederseniz, Mermaid diyagramları otomatik olarak render edilir!

```bash
git add .
git commit -m "Add ER diagrams"
git push
```

---

## 🎯 yUML Link (Online)

https://yuml.me/diagram/scruffy/class/draw sayfasına gidin ve yapıştırın:

```
[User]1-*[AvatarSession]
[User]1-*[Recording]
[PracticeText]1-*[AvatarSession]
[AvatarSession]1-*[Recording]
[AvatarSession]1-1[TranscriptComparison]
[Recording]1-1[TranscriptComparison]
```

PNG olarak indirebilirsiniz! 📸

