import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ElevenLabsService } from './services/ElevenLabsService';
import { DeepgramService } from './services/DeepgramService';

interface TranscriptItem {
  id: string;
  text: string;
  timestamp: Date;
  isFormatted: boolean;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [textToSpeak, setTextToSpeak] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('ffc51215ceaaebb330ee9cec4e407f5105086c728f13a17b4342620b3bf9bbba');
  const [deepgramApiKey, setDeepgramApiKey] = useState('d1bf1b213d063d453edce146b389f2b8af501e54');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [isConverting, setIsConverting] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [convertedAudioUri, setConvertedAudioUri] = useState<string | null>(null);
  const [isPlayingConverted, setIsPlayingConverted] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const recording = useRef<Audio.Recording | null>(null);
  const elevenLabsService = useRef<ElevenLabsService | null>(null);
  const deepgramService = useRef<DeepgramService | null>(null);

  useEffect(() => {
    // Initialize ElevenLabs service
    if (elevenLabsApiKey) {
      elevenLabsService.current = new ElevenLabsService({
        apiKey: elevenLabsApiKey
      });
      loadVoices();
    }

    // Initialize Deepgram service
    if (deepgramApiKey) {
      deepgramService.current = new DeepgramService({
        apiKey: deepgramApiKey
      });
    }
  }, [elevenLabsApiKey, deepgramApiKey]);

  const loadVoices = async () => {
    if (!elevenLabsService.current || !elevenLabsApiKey) {
      console.log('ElevenLabs service not initialized or API key missing');
      return;
    }

    try {
      console.log('Loading voices...');
      const voicesData = await elevenLabsService.current.getVoices();
      console.log('Voices loaded:', voicesData);
      setVoices(voicesData);
      
      if (voicesData.length > 0 && !selectedVoice) {
        setSelectedVoice(voicesData[0].voice_id);
      }
      
      if (voicesData.length === 0) {
        setError('No voices found in your ElevenLabs account');
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      setError(`Failed to load voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Create recording
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
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
      setError(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        console.log('Recording stopped, URI:', uri);
        setRecordedAudioUri(uri);
        recording.current = null;
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!deepgramService.current || !recordedAudioUri) {
      setError('Please record audio first and ensure Deepgram API key is set');
      return;
    }

    try {
      setIsConverting(true);
      setError('');

      console.log('Starting transcription with Deepgram...');
      console.log('Recorded audio URI:', recordedAudioUri);

      // Transcribe the recorded audio using Deepgram
      const result = await deepgramService.current.transcribeFromUri(recordedAudioUri, selectedLanguage);
      
      console.log('Transcription completed:', result);
      
      // Add transcript to history
      const newTranscript: TranscriptItem = {
        id: Date.now().toString(),
        text: result.text,
        timestamp: new Date(),
        isFormatted: true
      };
      setTranscripts(prev => [...prev, newTranscript]);
      
      setError(`Transcription completed! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('Error in transcription:', error);
      setError(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const startVoiceConversion = async () => {
    if (!elevenLabsService.current || !selectedVoice || !recordedAudioUri) {
      setError('Please record audio first and select a voice');
      return;
    }

    try {
      setIsConverting(true);
      setError('');

      console.log('Starting voice conversion with Deepgram + ElevenLabs...');
      console.log('Selected voice:', selectedVoice);
      console.log('Recorded audio URI:', recordedAudioUri);

      // First transcribe with Deepgram
      if (!deepgramService.current) {
        throw new Error('Deepgram service not initialized');
      }

      console.log('Transcribing audio with Deepgram...');
      const transcriptionResult = await deepgramService.current.transcribeFromUri(recordedAudioUri, selectedLanguage);
      
      console.log('Transcription result:', transcriptionResult);
      
      // Add transcript to history
      const newTranscript: TranscriptItem = {
        id: Date.now().toString(),
        text: transcriptionResult.text,
        timestamp: new Date(),
        isFormatted: true
      };
      setTranscripts(prev => [...prev, newTranscript]);

      // Then convert to speech with ElevenLabs
      console.log('Converting to speech with ElevenLabs...');
      const result = await elevenLabsService.current.textToSpeech(
        transcriptionResult.text,
        selectedVoice,
        (progress: number) => {
          console.log('TTS progress:', progress + '%');
        }
      );

      console.log('Voice conversion completed:', result);
      setConvertedAudioUri(result.uri);
      
      setError(`Voice conversion completed! Transcript: "${transcriptionResult.text}"`);
      
    } catch (error) {
      console.error('Error in voice conversion:', error);
      setError(`Voice conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  const playConvertedAudio = async () => {
    if (!convertedAudioUri) return;

    try {
      setIsPlayingConverted(true);

      // Create audio object and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: convertedAudioUri },
        { shouldPlay: true }
      );

      // Wait for playback to finish
      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && !status.isPlaying) {
            resolve(null);
          }
        });
      });

      // Clean up
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing converted audio:', error);
      setError('Failed to play converted audio');
    } finally {
      setIsPlayingConverted(false);
    }
  };

  const speakText = async () => {
    if (!textToSpeak.trim() || !elevenLabsService.current || !selectedVoice) {
      setError('Please enter text and select a voice');
      return;
    }

    try {
      setIsPlaying(true);
      setError('');

      const result = await elevenLabsService.current.textToSpeech(
        textToSpeak,
        selectedVoice,
        (progress: number) => {
          console.log('TTS progress:', progress + '%');
        }
      );

      // Play the generated audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: result.uri },
        { shouldPlay: true }
      );

      // Wait for playback to finish
      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && !status.isPlaying) {
            resolve(null);
          }
        });
      });

      await sound.unloadAsync();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setError(`TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice AI Assistant</Text>
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
        {/* Audio Recording Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="mic-outline" size={20} color={darkMode ? '#fff' : '#333'} /> Speech-to-Text
          </Text>
          
          <Text style={styles.demoInfo}>
            Record audio and transcribe it using Deepgram. Supports Turkish, English, and many other languages.
          </Text>
          
          <View style={styles.languageInfo}>
            <Text style={styles.languageInfoText}>
              Language: {deepgramService.current?.getSupportedLanguages().find(l => l.code === selectedLanguage)?.name || 'Auto-detect'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={styles.languageChangeButton}
            >
              <Text style={styles.languageChangeText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.primaryButton,
                isConverting && styles.disabledButton
              ]}
              disabled={isConverting}
            >
              <Ionicons 
                name={isRecording ? 'stop' : 'mic'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recording Status */}
          {isRecording && (
            <View style={styles.recordingStatus}>
              <Ionicons name="radio-button-on" size={16} color="#ff4444" />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}

          {/* Recorded Audio Info */}
          {recordedAudioUri && (
            <View style={styles.audioInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.audioInfoText}>Audio recorded successfully</Text>
              
              <TouchableOpacity
                onPress={transcribeAudio}
                style={[
                  styles.secondaryButton,
                  isConverting && styles.disabledButton
                ]}
                disabled={isConverting}
              >
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color="#2563eb" 
                />
                <Text style={styles.secondaryButtonText}>
                  {isConverting ? 'Transcribing...' : 'Transcribe Audio'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Transcript History */}
        {transcripts.length > 0 && (
          <View style={styles.transcriptSection}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptTitle}>
                <Ionicons name="document-text-outline" size={18} color={darkMode ? '#fff' : '#333'} /> Transcripts
              </Text>
              <TouchableOpacity onPress={() => setTranscripts([])}>
                <Ionicons name="trash-outline" size={18} color={darkMode ? '#888' : '#666'} />
              </TouchableOpacity>
            </View>
            
            {transcripts.map((item) => (
              <View key={item.id} style={styles.transcriptItem}>
                <Text style={styles.transcriptText}>{item.text}</Text>
                <Text style={styles.transcriptTime}>
                  {item.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Text-to-Speech Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="volume-high-outline" size={20} color={darkMode ? '#fff' : '#333'} /> Text-to-Speech
          </Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Enter text to convert to speech..."
            placeholderTextColor={darkMode ? '#888' : '#666'}
            value={textToSpeak}
            onChangeText={setTextToSpeak}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity
            onPress={speakText}
            style={[
              styles.primaryButton,
              isPlaying && styles.disabledButton
            ]}
            disabled={!textToSpeak.trim() || !selectedVoice || isPlaying}
          >
            <Ionicons 
              name={isPlaying ? 'hourglass-outline' : 'volume-high'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.buttonText}>
              {isPlaying ? 'Speaking...' : 'Speak Text'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice Conversion Section */}
        {voices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="swap-horizontal-outline" size={20} color={darkMode ? '#fff' : '#333'} /> Voice Conversion
            </Text>

            <View style={styles.voiceSelectionContainer}>
              <Text style={styles.voiceSelectionLabel}>Target Voice:</Text>
              <View style={styles.voiceSelectionRow}>
                <Text style={styles.selectedVoiceName}>
                  {voices.find(v => v.voice_id === selectedVoice)?.name || 'No voice selected'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowSettings(true)}
                  style={styles.changeVoiceButton}
                >
                  <Ionicons name="settings-outline" size={16} color={darkMode ? '#4A90E2' : '#2563eb'} />
                  <Text style={styles.changeVoiceText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.conversionInfo}>
              Record audio, transcribe with Deepgram, and convert to selected voice using ElevenLabs TTS
            </Text>

            <TouchableOpacity
              onPress={startVoiceConversion}
              style={[
                styles.primaryButton,
                isConverting && styles.disabledButton
              ]}
              disabled={!elevenLabsApiKey || isConverting || !recordedAudioUri}
            >
              <Ionicons 
                name={isConverting ? 'hourglass-outline' : 'swap-horizontal'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {isConverting ? 'Processing...' :
                 !recordedAudioUri ? 'Record Audio First' :
                 'Start Voice Conversion (STT + TTS)'}
              </Text>
            </TouchableOpacity>

            {convertedAudioUri && (
              <TouchableOpacity
                onPress={playConvertedAudio}
                style={[
                  styles.primaryButton,
                  isPlayingConverted && styles.disabledButton
                ]}
                disabled={isPlayingConverted}
              >
                <Ionicons 
                  name={isPlayingConverted ? 'hourglass-outline' : 'play'} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.buttonText}>
                  {isPlayingConverted ? 'Playing...' : 'Play Converted Audio'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with Deepgram (STT) & ElevenLabs (TTS)
          </Text>
          <Text style={styles.footerText}>
            Speech-to-Text and Voice Conversion powered by AI!
          </Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.container, styles.modalContainer]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color={darkMode ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Deepgram API (Speech-to-Text)</Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your Deepgram API key..."
                placeholderTextColor={darkMode ? '#888' : '#666'}
                value={deepgramApiKey}
                onChangeText={setDeepgramApiKey}
                secureTextEntry
              />
              
              <Text style={styles.settingLabel}>Language for Speech-to-Text</Text>
              <View style={styles.languageSelector}>
                {deepgramService.current?.getSupportedLanguages().map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      selectedLanguage === lang.code && styles.selectedLanguageOption
                    ]}
                    onPress={() => setSelectedLanguage(lang.code)}
                  >
                    <Text style={[
                      styles.languageText,
                      selectedLanguage === lang.code && styles.selectedLanguageText
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>ElevenLabs API (Text-to-Speech)</Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your ElevenLabs API key..."
                placeholderTextColor={darkMode ? '#888' : '#666'}
                value={elevenLabsApiKey}
                onChangeText={setElevenLabsApiKey}
                secureTextEntry
              />
            </View>

            {voices.length > 0 && (
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionTitle}>Select Voice</Text>
                {voices.map((voice) => (
                  <TouchableOpacity
                    key={voice.voice_id}
                    style={[
                      styles.voiceOption,
                      selectedVoice === voice.voice_id && styles.selectedVoiceOption
                    ]}
                    onPress={() => setSelectedVoice(voice.voice_id)}
                  >
                    <View style={styles.voiceInfo}>
                      <Text style={[
                        styles.voiceName,
                        selectedVoice === voice.voice_id && styles.selectedVoiceName
                      ]}>
                        {voice.name}
                      </Text>
                      {voice.description && (
                        <Text style={styles.voiceDescription}>{voice.description}</Text>
                      )}
                    </View>
                    {selectedVoice === voice.voice_id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
    </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const darkMode = false; // This will be dynamic in the component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#444' : '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
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
  section: {
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  demoInfo: {
    fontSize: 14,
    color: darkMode ? '#888' : '#666',
    marginBottom: 16,
    fontStyle: 'italic',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  languageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#e0e0e0',
  },
  languageInfoText: {
    fontSize: 14,
    color: darkMode ? '#fff' : '#333',
    fontWeight: '500',
  },
  languageChangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  languageChangeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkMode ? '#2d1b1b' : '#ffeaea',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkMode ? '#1b2d1b' : '#eafaea',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  audioInfoText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  transcriptSection: {
    marginTop: 16,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptItem: {
    backgroundColor: darkMode ? '#333' : '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 14,
    color: darkMode ? '#fff' : '#333',
    marginBottom: 4,
  },
  transcriptTime: {
    fontSize: 12,
    color: darkMode ? '#888' : '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: darkMode ? '#fff' : '#333',
    backgroundColor: darkMode ? '#333' : '#fff',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  voiceSelectionContainer: {
    marginBottom: 16,
  },
  voiceSelectionLabel: {
    fontSize: 14,
    color: darkMode ? '#888' : '#666',
    marginBottom: 8,
  },
  voiceSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkMode ? '#333' : '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  selectedVoiceName: {
    fontSize: 16,
    color: darkMode ? '#fff' : '#333',
    fontWeight: '500',
  },
  changeVoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeVoiceText: {
    fontSize: 14,
    color: darkMode ? '#4A90E2' : '#2563eb',
    fontWeight: '500',
  },
  conversionInfo: {
    fontSize: 14,
    color: darkMode ? '#888' : '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: darkMode ? '#888' : '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalContainer: {
    backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#444' : '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#333',
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
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: darkMode ? '#fff' : '#333',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 12,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: darkMode ? '#fff' : '#333',
    backgroundColor: darkMode ? '#333' : '#fff',
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#e0e0e0',
  },
  selectedVoiceOption: {
    borderColor: '#4CAF50',
    backgroundColor: darkMode ? '#1b2d1b' : '#e8f5e8',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 14,
    color: darkMode ? '#888' : '#666',
  },
  languageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  languageOption: {
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkMode ? '#444' : '#e0e0e0',
  },
  selectedLanguageOption: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  languageText: {
    fontSize: 12,
    color: darkMode ? '#fff' : '#333',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#fff',
  },
});