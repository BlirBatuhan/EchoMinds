import { Audio } from 'expo-av';

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  files: File[];
}

export class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default voice
  }

  async getVoices(): Promise<Voice[]> {
    try {
      console.log('Fetching voices from ElevenLabs...');
      console.log('API Key:', this.apiKey.substring(0, 10) + '...');
      
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch voices: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Voices data:', data);
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  async textToSpeech(
    text: string,
    voiceId?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ uri: string }> {
    const selectedVoiceId = voiceId || this.voiceId;
    
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      
      // Convert blob to URI for React Native
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve({ uri: reader.result as string });
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  async cloneVoice(voiceData: VoiceCloneRequest): Promise<Voice> {
    try {
      const formData = new FormData();
      formData.append('name', voiceData.name);
      
      if (voiceData.description) {
        formData.append('description', voiceData.description);
      }

      // Add audio files
      voiceData.files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice cloning failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cloning voice:', error);
      throw error;
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  }

  async playAudio(audioUri: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  setVoiceId(voiceId: string): void {
    this.voiceId = voiceId;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // ElevenLabs doesn't have a transcription API, so we'll return a placeholder
    // In a real implementation, you would use a different service for transcription
    console.log('ElevenLabs transcription not available, using placeholder text');
    return 'This is a placeholder transcription. ElevenLabs does not provide speech-to-text services.';
  }

  async speechToSpeech(
    audioBlob: Blob,
    targetVoiceId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ uri: string; transcript?: string }> {
    try {
      console.log('Starting speech-to-speech with ElevenLabs...');
      console.log('Target voice ID:', targetVoiceId);

      // Get placeholder transcription (since ElevenLabs doesn't have STT)
      const transcript = await this.transcribeAudio(audioBlob);
      console.log('Using placeholder transcript:', transcript);

      // Convert the placeholder text to speech with target voice
      const result = await this.textToSpeech(transcript, targetVoiceId, onProgress);
      
      return {
        uri: result.uri,
        transcript: transcript
      };

    } catch (error) {
      console.error('Error in speech-to-speech:', error);
      throw error;
    }
  }

  async voiceConversion(
    audioBlob: Blob,
    targetVoiceId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ uri: string; transcript?: string }> {
    try {
      console.log('Starting voice conversion with ElevenLabs...');
      console.log('Target voice ID:', targetVoiceId);
      
      // Use speech-to-speech approach
      return await this.speechToSpeech(audioBlob, targetVoiceId, onProgress);
      
    } catch (error) {
      console.error('Error in voice conversion:', error);
      throw error;
    }
  }
}
