import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '../config';

// Tip tanımlamaları
export interface PracticeText {
  id: number;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  active: boolean;
  tags?: string[];
}

export interface AvatarSession {
  id: number;
  user_id: number;
  practice_text_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  d_id_job_id?: string;
  created_at: string;
  updated_at: string;
  practice_text?: PracticeText;
}

export interface Recording {
  id: number;
  user_id: number;
  avatar_session_id?: number;
  storage_url: string;
  duration_ms?: number;
  waveform?: any;
  created_at: string;
  updated_at: string;
}

export interface TranscriptComparison {
  id: number;
  avatar_session_id: number;
  recording_id: number;
  reference_text: string;
  transcript_text: string;
  similarity_score: number;
  mismatched_words?: {
    missing: string[];
    extra: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

/**
 * Backend API servisi
 */
export class ApiService {
  /**
   * Rastgele pratik metni al
   */
  static async getRandomPracticeText(
    language: string = 'en',
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<PracticeText> {
    let url = `${API_ENDPOINTS.practiceTexts.random}?language=${language}`;
    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch practice text: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Tüm pratik metinleri listele
   */
  static async listPracticeTexts(
    language?: string,
    difficulty?: string
  ): Promise<PracticeText[]> {
    let url = API_ENDPOINTS.practiceTexts.list;
    const params = new URLSearchParams();
    
    if (language) params.append('language', language);
    if (difficulty) params.append('difficulty', difficulty);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch practice texts: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Avatar session oluştur
   */
  static async createAvatarSession(practiceTextId: number): Promise<AvatarSession> {
    const response = await fetch(API_ENDPOINTS.avatarSessions.create, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        avatar_session: {
          practice_text_id: practiceTextId,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.join(', ') || 'Failed to create avatar session');
    }
    
    return response.json();
  }

  /**
   * Avatar videosu oluştur (background job başlat)
   */
  static async generateAvatarVideo(sessionId: number): Promise<{ message: string; session: AvatarSession }> {
    const response = await fetch(API_ENDPOINTS.avatarSessions.generateVideo(sessionId), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate video');
    }
    
    return response.json();
  }

  /**
   * Avatar session durumunu kontrol et
   */
  static async getAvatarSession(sessionId: number): Promise<AvatarSession> {
    const response = await fetch(API_ENDPOINTS.avatarSessions.show(sessionId), {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch avatar session');
    }
    
    return response.json();
  }

  /**
   * Avatar session'ın tamamlanmasını bekle (polling)
   */
  static async waitForVideoCompletion(
    sessionId: number,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const session = await this.getAvatarSession(sessionId);
      
      if (session.status === 'completed' && session.video_url) {
        return session.video_url;
      }
      
      if (session.status === 'failed') {
        throw new Error('Video generation failed');
      }
      
      // Bekle
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Video generation timeout');
  }

  /**
   * Ses kaydı yükle
   */
  static async uploadRecording(data: {
    storage_url: string;
    duration_ms?: number;
    avatar_session_id?: number;
    waveform?: any;
  }): Promise<Recording> {
    const response = await fetch(API_ENDPOINTS.recordings.create, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recording: data }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.join(', ') || 'Failed to upload recording');
    }
    
    return response.json();
  }

  /**
   * Ses kaydını transkript et (background job başlat)
   */
  static async transcribeRecording(recordingId: number): Promise<{ message: string; recording: Recording }> {
    const response = await fetch(API_ENDPOINTS.recordings.transcribe(recordingId), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to transcribe recording');
    }
    
    return response.json();
  }

  /**
   * Kayıt durumunu kontrol et
   */
  static async getRecording(recordingId: number): Promise<Recording & { transcript_comparison?: TranscriptComparison }> {
    const response = await fetch(API_ENDPOINTS.recordings.show(recordingId), {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recording');
    }
    
    return response.json();
  }

  /**
   * Transkript karşılaştırmalarını listele
   */
  static async listTranscriptComparisons(): Promise<TranscriptComparison[]> {
    const response = await fetch(API_ENDPOINTS.transcriptComparisons.list, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transcript comparisons');
    }
    
    return response.json();
  }

  /**
   * Transkript karşılaştırması detayı
   */
  static async getTranscriptComparison(comparisonId: number): Promise<TranscriptComparison> {
    const response = await fetch(API_ENDPOINTS.transcriptComparisons.show(comparisonId), {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transcript comparison');
    }
    
    return response.json();
  }

  /**
   * Mevcut kullanıcı bilgisi
   */
  static async getCurrentUser(): Promise<User> {
    const response = await fetch(API_ENDPOINTS.user.me, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    return response.json();
  }

  /**
   * Transkript tamamlanmasını bekle (polling)
   */
  static async waitForTranscription(
    recordingId: number,
    maxAttempts: number = 60,
    interval: number = 2000
  ): Promise<TranscriptComparison> {
    for (let i = 0; i < maxAttempts; i++) {
      const recording = await this.getRecording(recordingId);
      
      if (recording.transcript_comparison) {
        return recording.transcript_comparison;
      }
      
      // Bekle
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Transcription timeout');
  }
}

