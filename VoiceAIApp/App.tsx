import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video, ResizeMode } from 'expo-av';
import LottieView from 'lottie-react-native';
import { AssemblyAIService } from './services/AssemblyAIService';
import { DIdService } from './services/D-IDService';
import { ApiService, PracticeText, AvatarSession } from './services/ApiService';

interface TranscriptItem {
  id: string;
  text: string;
  timestamp: Date;
  similarity?: number;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dIdApiKey] = useState('YmlsaXJiYXR1OThAZ21haWwuY29t:3DEdeaHwp8-wMTw9KzTit');
  const [assemblyAIApiKey] = useState('1841b85fc5cf4678a63268cada518727');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarText, setAvatarText] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  
  // Backend state
  const [currentPracticeText, setCurrentPracticeText] = useState<PracticeText | null>(null);
  const [currentAvatarSession, setCurrentAvatarSession] = useState<AvatarSession | null>(null);
  const [useBackend, setUseBackend] = useState(true); // Backend kullanımı toggle

  const recording = useRef<Audio.Recording | null>(null);
  const assemblyAIService = useRef<AssemblyAIService | null>(null);
  const dIdService = useRef<DIdService | null>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Initialize AssemblyAI service for STT
    if (assemblyAIApiKey) {
      assemblyAIService.current = new AssemblyAIService({
        apiKey: assemblyAIApiKey
      });
    }

    // Initialize D-ID service for TTS
    if (dIdApiKey) {
      dIdService.current = new DIdService({
        apiKey: dIdApiKey
      });
    }
  }, [dIdApiKey, assemblyAIApiKey]);

  // English practice texts for avatar
  const AVATAR_TEXTS = [
    "Hello, how are you today?",
    "The weather is beautiful today.",
    "I love learning new languages.",
    "What is your favorite color?",
    "Let's practice English together.",
    "This is a great day for learning.",
    "Can you repeat after me?",
    "I enjoy reading books very much.",
    "The sun is shining brightly.",
    "Learning is fun and exciting.",
    "How was your weekend?",
    "I like to play soccer.",
    "What do you do for fun?",
    "The cat sat on the mat.",
    "She sells sea shells by the sea shore.",
  ];

  // Text similarity function
  const calculateTextSimilarity = (text1: string, text2: string): number => {
    const normalize = (text: string) => text.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    if (normalized1 === normalized2) return 100;
    
    // Simple word-based similarity
    const words1 = normalized1.split(' ').filter(w => w.length > 0);
    const words2 = normalized2.split(' ').filter(w => w.length > 0);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return Math.round((commonWords.length / totalWords) * 100);
  };

  // Backend'den rastgele metin al
  const loadRandomTextFromBackend = async () => {
    try {
      setError('Backend\'den metin yükleniyor...');
      const practiceText = await ApiService.getRandomPracticeText('en', 'beginner');
      setCurrentPracticeText(practiceText);
      setAvatarText(practiceText.content);
      setError('');
      console.log('Backend\'den metin alındı:', practiceText);
    } catch (error) {
      console.error('Backend metin hatası:', error);
      setError('Backend\'den metin alınamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      // Fallback: local metin kullan
      const randomText = AVATAR_TEXTS[Math.floor(Math.random() * AVATAR_TEXTS.length)];
      setAvatarText(randomText);
    }
  };

  // Avatar functions - Backend üzerinden D-ID ile video oluşturma
  const speakAvatarTextWithBackend = async () => {
    if (!avatarText || !currentPracticeText) {
      setError('Önce bir metin seçin');
      return;
    }
    
    try {
      setIsSpeaking(true);
      setError('');
      setIsProcessingVideo(true);
      
      console.log('Backend üzerinden avatar videosu oluşturuluyor...');
      
      // 1. Avatar session oluştur
      const session = await ApiService.createAvatarSession(currentPracticeText.id);
      setCurrentAvatarSession(session);
      console.log('Avatar session oluşturuldu:', session.id);
      
      // 2. Video oluşturma job'ı başlat
      await ApiService.generateAvatarVideo(session.id);
      console.log('Video oluşturma başladı, bekleniyor...');
      
      // 3. Video tamamlanana kadar bekle (polling)
      const videoUrl = await ApiService.waitForVideoCompletion(session.id);
      
      console.log('Video hazır:', videoUrl);
      setCurrentVideoUrl(videoUrl);
      setIsProcessingVideo(false);
      
      // Play the video
      setTimeout(async () => {
        if (videoRef.current) {
          try {
            await videoRef.current.loadAsync({ uri: videoUrl }, { shouldPlay: true });
          } catch (loadError) {
            console.error('Error loading video:', loadError);
          }
        }
      }, 500);
      
    } catch (error) {
      console.error('Backend video hatası:', error);
      setError('Video oluşturulurken hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setIsProcessingVideo(false);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Eski D-ID servisi ile direkt video oluşturma (fallback)
  const speakAvatarText = async () => {
    if (!avatarText || !dIdService.current) return;
    
    try {
      setIsSpeaking(true);
      setError('');
      setIsProcessingVideo(true);
      
      console.log('Creating D-ID talk with text:', avatarText);
      const videoUrl = await dIdService.current.textToSpeech(avatarText);
      
      console.log('D-ID video created:', videoUrl);
      setCurrentVideoUrl(videoUrl);
      setIsProcessingVideo(false);
      
      setTimeout(async () => {
        if (videoRef.current) {
          try {
            await videoRef.current.loadAsync({ uri: videoUrl }, { shouldPlay: true });
          } catch (loadError) {
            console.error('Error loading video:', loadError);
          }
        }
      }, 500);
      
    } catch (error) {
      console.error('Error creating D-ID talk:', error);
      setError('Avatar videosu oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setIsProcessingVideo(false);
    } finally {
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Audio permission not granted');
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording with simplified options
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      recording.current = new Audio.Recording();
      await recording.current.prepareToRecordAsync(recordingOptions);
      await recording.current.startAsync();
      
      setIsRecording(true);
      console.log('Recording started successfully');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(`Ses kaydı başlatılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. ⚠️ Not: Expo Go mikrofon desteklemez - Development build gerekir!`);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        console.log('Recording stopped, URI:', uri);
        
        // Transcribe the recorded audio with AssemblyAI STT
        if (uri && assemblyAIService.current) {
          try {
            setError('Transcribing audio...');
            
            // Use AssemblyAI STT with URI
            const transcription = await assemblyAIService.current.transcribeAudio(uri);
            
            // Calculate similarity if we have avatar text
            let similarity: number | undefined = undefined;
            if (avatarText) {
              similarity = calculateTextSimilarity(avatarText, transcription);
            }
            
            // Add to transcripts
            const newTranscript: TranscriptItem = {
              id: Date.now().toString(),
              text: transcription,
              timestamp: new Date(),
              similarity
            };
            setTranscripts(prev => [...prev, newTranscript]);
            setError('');
          } catch (transcribeError) {
            console.error('Transcription error:', transcribeError);
            setError('Transkripsiyon hatası: ' + (transcribeError instanceof Error ? transcribeError.message : 'Bilinmeyen hata'));
          }
        }
        
        recording.current = null;
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(`Ses kaydı durdurulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. ⚠️ Not: Expo Go mikrofon desteklemez - Development build gerekir!`);
      setIsRecording(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Sesli Pratik</Text>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={darkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Video Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>
            📚 Öğreneceğiniz Cümle
          </Text>
          
          <View style={styles.avatarContainer}>
            {isProcessingVideo ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Video oluşturuluyor...</Text>
              </View>
            ) : currentVideoUrl ? (
              <Video
                ref={videoRef}
                source={{ uri: currentVideoUrl }}
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay={false}
                style={styles.video}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="film-outline" size={64} color={darkMode ? '#666' : '#999'} />
                <Text style={styles.placeholderText}>Avatar videoyu burada görünecek</Text>
              </View>
            )}
          </View>
          
          {/* Metin Alanı */}
          <View style={styles.textContainer}>
            <Text style={styles.avatarText}>
              {avatarText || "🔝 Önce bir metin seçin"}
            </Text>
          </View>
          
          {/* Butonlar */}
          <View style={styles.avatarButtons}>
            <TouchableOpacity
              onPress={() => {
                if (useBackend) {
                  loadRandomTextFromBackend();
                } else {
                  const randomText = AVATAR_TEXTS[Math.floor(Math.random() * AVATAR_TEXTS.length)];
                  setAvatarText(randomText);
                }
                setCurrentVideoUrl(null);
              }}
              style={[styles.avatarButton, styles.generateButton]}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.avatarButtonText}>
                {useBackend ? '🌐 Backend Metin' : '🔄 Yeni Metin'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={useBackend ? speakAvatarTextWithBackend : speakAvatarText}
              style={[styles.avatarButton, styles.speakButton]}
              disabled={isSpeaking || !avatarText}
            >
              {isSpeaking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="play" size={20} color="#fff" />
              )}
              <Text style={styles.avatarButtonText}>
                {isSpeaking ? 'Oynatılıyor...' : '▶️ Oynat'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Backend Toggle */}
          <View style={styles.backendToggle}>
            <Text style={styles.backendToggleText}>
              Backend Kullan: {useBackend ? '✅' : '❌'}
            </Text>
            <Switch
              value={useBackend}
              onValueChange={setUseBackend}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={useBackend ? '#2196F3' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={styles.sectionTitle}>
            🎤 Tekrar Edin
          </Text>
          
          <Text style={styles.recordingInfo}>
            Yukarıdaki cümleyi duyduktan sonra, aşağıdaki butona basın ve aynı cümleyi tekrar edin.
          </Text>
          
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            disabled={false}
          >
            <Ionicons 
              name={isRecording ? 'stop-circle' : 'mic-circle'} 
              size={48} 
              color="#fff" 
            />
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Kaydı Durdur ⏹️' : 'Kayda Başla 🎙️'}
            </Text>
          </TouchableOpacity>
          
          {isRecording && (
            <View style={styles.recordingStatus}>
              <Ionicons name="radio-button-on" size={20} color="#ff4444" />
              <Text style={styles.recordingText}>Kaydediliyor... Konuşun!</Text>
            </View>
          )}
          
          {transcripts.length > 0 && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptTitle}>📝 Kaydedilen Metinler:</Text>
              {transcripts.map((transcript) => (
                <View key={transcript.id} style={styles.transcriptItem}>
                  <Text style={styles.transcriptText}>{transcript.text}</Text>
                  <View style={styles.transcriptFooter}>
                    <Text style={styles.transcriptTime}>
                      {transcript.timestamp.toLocaleTimeString()}
                    </Text>
                    {transcript.similarity !== undefined && (
                      <View style={[
                        styles.similarityBadge,
                        transcript.similarity >= 80 && styles.similarityGood,
                        transcript.similarity >= 50 && transcript.similarity < 80 && styles.similarityMedium,
                        transcript.similarity < 50 && styles.similarityBad
                      ]}>
                        <Text style={styles.similarityText}>
                          {transcript.similarity}% eşleşme
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by D-ID (Avatar TTS) & AssemblyAI (STT)
          </Text>
          <Text style={styles.footerText}>
            AI destekli sesli pratik uygulaması 🚀
          </Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚙️ Ayarlar</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🌙 Karanlık Mod</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  avatarSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  textContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButton: {
    backgroundColor: '#2196F3',
  },
  speakButton: {
    backgroundColor: '#4CAF50',
  },
  avatarButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  recordingSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recordingInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  recordButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 24,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  recordingText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transcriptItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  transcriptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transcriptTime: {
    fontSize: 12,
    color: '#666',
  },
  similarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityGood: {
    backgroundColor: '#c8e6c9',
  },
  similarityMedium: {
    backgroundColor: '#fff9c4',
  },
  similarityBad: {
    backgroundColor: '#ffcdd2',
  },
  similarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  backendToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backendToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
});
