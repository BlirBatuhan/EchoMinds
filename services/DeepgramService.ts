import { Audio } from 'expo-av';

export interface DeepgramConfig {
  apiKey: string;
}

export interface TranscriptResult {
  text: string;
  confidence: number;
  language?: string;
}

export class DeepgramService {
  private apiKey: string;
  private baseUrl = 'https://api.deepgram.com/v1';

  constructor(config: DeepgramConfig) {
    this.apiKey = config.apiKey;
  }

  async transcribeAudio(audioBlob: Blob, language: string = 'auto'): Promise<TranscriptResult> {
    try {
      console.log('Starting Deepgram transcription...');
      console.log('Language:', language);
      console.log('Audio blob size:', audioBlob.size);

      // Deepgram API endpoint - add language parameter
      let url = `${this.baseUrl}/listen?smart_format=true&punctuate=true`;
      
      // Add language parameter if not auto-detect
      if (language && language !== 'auto') {
        url += `&language=${language}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBlob,
      });

      console.log('Deepgram response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepgram transcription error:', errorText);
        throw new Error(`Deepgram transcription failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Deepgram transcription result:', JSON.stringify(result, null, 2));
      console.log('Deepgram results.channels:', JSON.stringify(result.results?.channels, null, 2));

      // Extract transcript from Deepgram response with better error handling
      let transcript = '';
      let confidence = 0;
      let detectedLanguage = language;

      try {
        // Try different possible response structures
        if (result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
          transcript = result.results.channels[0].alternatives[0].transcript;
          confidence = result.results.channels[0].alternatives[0].confidence || 0;
        } else if (result.results?.alternatives?.[0]?.transcript) {
          transcript = result.results.alternatives[0].transcript;
          confidence = result.results.alternatives[0].confidence || 0;
        } else if (result.transcript) {
          transcript = result.transcript;
          confidence = result.confidence || 0;
        } else {
          console.log('Full response structure:', result);
          throw new Error(`Unexpected response structure. Full response: ${JSON.stringify(result)}`);
        }

        // Get detected language if available
        if (result.results?.channels?.[0]?.language) {
          detectedLanguage = result.results.channels[0].language;
        } else if (result.language) {
          detectedLanguage = result.language;
        }

        if (!transcript || transcript.trim() === '') {
          throw new Error('Empty transcript received from Deepgram');
        }

      } catch (extractError) {
        console.error('Error extracting transcript:', extractError);
        const errorMessage = extractError instanceof Error ? extractError.message : 'Unknown extraction error';
        throw new Error(`Failed to extract transcript from Deepgram response: ${errorMessage}`);
      }

      return {
        text: transcript,
        confidence: confidence,
        language: detectedLanguage
      };

    } catch (error) {
      console.error('Error in Deepgram transcription:', error);
      throw error;
    }
  }

  async transcribeFromUri(audioUri: string, language: string = 'auto'): Promise<TranscriptResult> {
    try {
      console.log('Converting audio URI to blob for Deepgram...');
      
      // Convert URI to blob
      const response = await fetch(audioUri);
      const audioBlob = await response.blob();
      
      console.log('Audio blob created, size:', audioBlob.size);
      
      // Use the existing transcribeAudio method
      return await this.transcribeAudio(audioBlob, language);
      
    } catch (error) {
      console.error('Error transcribing from URI:', error);
      throw error;
    }
  }

  // Test the API key
  async testApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Deepgram API key:', error);
      return false;
    }
  }

  // Get supported languages
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'auto', name: 'Auto-detect' },
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'tr-TR', name: 'Türkçe' },
      { code: 'es-ES', name: 'Español' },
      { code: 'fr-FR', name: 'Français' },
      { code: 'de-DE', name: 'Deutsch' },
      { code: 'it-IT', name: 'Italiano' },
      { code: 'pt-PT', name: 'Português' },
      { code: 'ru-RU', name: 'Русский' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'ko-KR', name: '한국어' },
      { code: 'zh-CN', name: '中文' },
      { code: 'ar-SA', name: 'العربية' },
      { code: 'hi-IN', name: 'हिन्दी' },
    ];
  }
}
