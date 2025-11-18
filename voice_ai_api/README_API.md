# 🎯 Voice AI API Backend

Ruby on Rails 8 API backend for the Voice AI mobile application.

## 📋 Features

- **5 Core Models**: User, PracticeText, AvatarSession, Recording, TranscriptComparison
- **RESTful API Endpoints**: Full CRUD operations for all resources
- **D-ID Integration**: Avatar video generation with text-to-speech
- **AssemblyAI Integration**: Audio transcription and comparison
- **Background Jobs**: Async processing for video generation and transcription
- **Authentication**: API token-based authentication
- **CORS Enabled**: Ready for mobile app integration

## 🚀 Quick Start

### Prerequisites

- Ruby 3.3+
- Rails 8.0+
- SQLite3 (or PostgreSQL for production)

### Installation

```bash
cd voice_ai_api
bundle install
rails db:create db:migrate db:seed
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
D_ID_API_KEY=your_d_id_api_key
ELEVEN_LABS_API_KEY=your_eleven_labs_key
ASSEMBLY_AI_API_KEY=your_assembly_ai_key
```

### Start Server

```bash
rails server -p 3000
```

API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Practice Texts

- `GET /api/v1/practice_texts` - List all practice texts
- `GET /api/v1/practice_texts/random?language=en&difficulty=beginner` - Get random text
- `GET /api/v1/practice_texts/:id` - Show specific text
- `POST /api/v1/practice_texts` - Create new text (auth required)
- `PUT /api/v1/practice_texts/:id` - Update text (auth required)
- `DELETE /api/v1/practice_texts/:id` - Delete text (auth required)

### Avatar Sessions

- `GET /api/v1/avatar_sessions` - List user's sessions (auth required)
- `GET /api/v1/avatar_sessions/:id` - Show session details (auth required)
- `POST /api/v1/avatar_sessions` - Create new session (auth required)
- `POST /api/v1/avatar_sessions/:id/generate_video` - Generate avatar video (auth required)

### Recordings

- `POST /api/v1/recordings` - Upload recording (auth required)
- `GET /api/v1/recordings/:id` - Show recording (auth required)
- `POST /api/v1/recordings/:id/transcribe` - Transcribe audio (auth required)

### Transcript Comparisons

- `GET /api/v1/transcript_comparisons` - List user's comparisons (auth required)
- `GET /api/v1/transcript_comparisons/:id` - Show comparison details (auth required)

### User

- `GET /api/v1/me` - Get current user info (auth required)
- `GET /api/v1/users/:id` - Get user by ID (auth required)

## 🔐 Authentication

All authenticated endpoints require an `Authorization` header:

```
Authorization: Bearer YOUR_API_TOKEN
```

### Test Credentials

After running `rails db:seed`, you'll get:

- **Admin**: admin@voiceai.com
- **Student**: student@example.com

API tokens are printed in the seed output.

## 📊 Database Schema

### Users
- `email` (string, unique)
- `role` (enum: student, admin)
- `api_token_digest` (string)
- `credits_remaining` (integer, default: 300 minutes)

### PracticeTexts
- `content` (text)
- `difficulty` (enum: beginner, intermediate, advanced)
- `language` (string: en, tr, es, fr, de)
- `tags` (json)
- `active` (boolean)

### AvatarSessions
- `user_id` (foreign key)
- `practice_text_id` (foreign key)
- `status` (enum: pending, processing, completed, failed)
- `video_url` (string)
- `d_id_job_id` (string)

### Recordings
- `user_id` (foreign key)
- `avatar_session_id` (foreign key, optional)
- `storage_url` (string)
- `duration_ms` (integer)
- `waveform` (json)

### TranscriptComparisons
- `avatar_session_id` (foreign key)
- `recording_id` (foreign key)
- `reference_text` (text)
- `transcript_text` (text)
- `similarity_score` (integer, 0-100)
- `mismatched_words` (json)

## 🛠️ Services

### DIdService
```ruby
service = DIdService.new(
  api_key: 'your_key',
  eleven_labs_api_key: 'your_key'
)

video_url = service.text_to_speech(text: "Hello world")
```

### AssemblyAIService
```ruby
service = AssemblyAIService.new(api_key: 'your_key')
transcript = service.transcribe_audio(audio_url: 'https://...')
```

## 🎬 Background Jobs

- `GenerateAvatarVideoJob` - Handles D-ID video generation
- `TranscribeAudioJob` - Handles AssemblyAI transcription and comparison

Jobs run with `Solid Queue` (Rails 8 default).

## 📝 Example API Calls

### Get Random Practice Text

```bash
curl http://localhost:3000/api/v1/practice_texts/random?language=en
```

### Create Avatar Session

```bash
curl -X POST http://localhost:3000/api/v1/avatar_sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatar_session":{"practice_text_id":1}}'
```

### Generate Video

```bash
curl -X POST http://localhost:3000/api/v1/avatar_sessions/1/generate_video \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Recording

```bash
curl -X POST http://localhost:3000/api/v1/recordings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recording":{"storage_url":"https://...","duration_ms":5000,"avatar_session_id":1}}'
```

### Transcribe Recording

```bash
curl -X POST http://localhost:3000/api/v1/recordings/1/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Development

### Check Routes

```bash
rails routes
```

### Run Console

```bash
rails console
```

### Run Tests

```bash
rails test
```

## 📦 Production Deployment

### Kamal (Docker)

Rails 8 includes Kamal for easy deployment:

```bash
kamal setup
kamal deploy
```

### Environment Variables

Set these on your production server:

- `D_ID_API_KEY`
- `ELEVEN_LABS_API_KEY`
- `ASSEMBLY_AI_API_KEY`
- `SECRET_KEY_BASE`
- `RAILS_MASTER_KEY`

## 🤝 Integration with Mobile App

Update mobile app to point to this backend:

```typescript
const API_URL = 'http://localhost:3000/api/v1';
const API_TOKEN = 'user_api_token_here';

// Get random text
const response = await fetch(`${API_URL}/practice_texts/random?language=en`, {
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`
  }
});

const practiceText = await response.json();
```

## 📄 License

MIT

## 👤 Author

Voice AI Team

