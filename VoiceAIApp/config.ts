// API Configuration
export const API_CONFIG = {
  // Backend API URL - geliştirme ortamı için localhost
  BASE_URL: 'http://localhost:3000/api/v1',
  
  // Test kullanıcısı API token (rails db:seed çıktısından alın)
  // Gerçek uygulamada bu token kullanıcı girişi sonrası kaydedilmeli
  API_TOKEN: 'YOUR_API_TOKEN_HERE', // Seed çıktısından token'ı buraya yapıştırın
  
  // Timeout ayarları
  TIMEOUT: 30000, // 30 saniye
};

// API Headers
export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
  'Content-Type': 'application/json',
});

// API Endpoints
export const API_ENDPOINTS = {
  // Practice Texts
  practiceTexts: {
    list: `${API_CONFIG.BASE_URL}/practice_texts`,
    random: `${API_CONFIG.BASE_URL}/practice_texts/random`,
    show: (id: number) => `${API_CONFIG.BASE_URL}/practice_texts/${id}`,
  },
  
  // Avatar Sessions
  avatarSessions: {
    list: `${API_CONFIG.BASE_URL}/avatar_sessions`,
    create: `${API_CONFIG.BASE_URL}/avatar_sessions`,
    show: (id: number) => `${API_CONFIG.BASE_URL}/avatar_sessions/${id}`,
    generateVideo: (id: number) => `${API_CONFIG.BASE_URL}/avatar_sessions/${id}/generate_video`,
  },
  
  // Recordings
  recordings: {
    create: `${API_CONFIG.BASE_URL}/recordings`,
    show: (id: number) => `${API_CONFIG.BASE_URL}/recordings/${id}`,
    transcribe: (id: number) => `${API_CONFIG.BASE_URL}/recordings/${id}/transcribe`,
  },
  
  // Transcript Comparisons
  transcriptComparisons: {
    list: `${API_CONFIG.BASE_URL}/transcript_comparisons`,
    show: (id: number) => `${API_CONFIG.BASE_URL}/transcript_comparisons/${id}`,
  },
  
  // User
  user: {
    me: `${API_CONFIG.BASE_URL}/me`,
    show: (id: number) => `${API_CONFIG.BASE_URL}/users/${id}`,
  },
};

