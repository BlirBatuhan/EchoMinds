export interface DIdConfig {
  apiKey: string;
  elevenLabsApiKey?: string;
}

export interface CreateTalkRequest {
  source_url: string;
  script: {
    type: string;
    input?: string;
    provider?: {
      type: string;
      voice_id?: string;
    };
    subtitles?: boolean;
    reduce_noise?: boolean;
  };
}

export interface TalkResponse {
  id: string;
  status: string;
  created_at: string;
  result_url?: string;
}

export class DIdService {
  private apiKey: string;
  private elevenLabsApiKey?: string;
  private baseUrl = 'https://api.d-id.com';

  constructor(config: DIdConfig) {
    this.apiKey = config.apiKey;
    this.elevenLabsApiKey = config.elevenLabsApiKey;
  }

  /**
   * Metni konuşturan bir avatar videosu oluşturur
   */
  async createTalk(text: string, voiceId: string = 'NDTYOmYEjbDIVCKB35i3'): Promise<TalkResponse> {
    try {
      console.log('Creating D-ID talk with text:', text.substring(0, 50) + '...');
      
      // Use Alice avatar from D-ID's public bucket
      const requestBody: any = {
        source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          provider: {
            type: 'elevenlabs',
            voice_id: voiceId,
            model_id: 'eleven_flash_v2_5'
          },
          input: text
        }
      };

      // Prepare headers with optional ElevenLabs API key
      const headers: any = {
        'Authorization': `Basic ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      
      // Add ElevenLabs API key if provided
      if (this.elevenLabsApiKey) {
        headers['x-api-key-external'] = JSON.stringify({ elevenlabs: this.elevenLabsApiKey });
      }

      const response = await fetch(`${this.baseUrl}/talks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create talk: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Talk created:', data);
      return data;
    } catch (error) {
      console.error('Error creating talk:', error);
      throw error;
    }
  }

  /**
   * Talk oluşturma durumunu kontrol eder
   */
  async getTalkStatus(talkId: string): Promise<TalkResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/talks/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to get talk status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting talk status:', error);
      throw error;
    }
  }

  /**
   * Talk'un tamamlanmasını bekler ve sonucu döner
   */
  async waitForTalkCompletion(talkId: string, maxWaitTime: number = 60000): Promise<string> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 saniyede bir kontrol et

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const talk = await this.getTalkStatus(talkId);
          
          if (talk.status === 'done' && talk.result_url) {
            resolve(talk.result_url);
          } else if (talk.status === 'error') {
            reject(new Error('Talk creation failed'));
          } else if (Date.now() - startTime > maxWaitTime) {
            reject(new Error('Talk creation timeout'));
          } else {
            // Devam ediyor, tekrar kontrol et
            setTimeout(checkStatus, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }

  /**
   * Text-to-Speech için basitleştirilmiş metot
   * Metni alır, avatar videosunu oluşturur ve video URL'sini döner
   */
  async textToSpeech(text: string, voiceId?: string): Promise<string> {
    const talk = await this.createTalk(text, voiceId);
    const resultUrl = await this.waitForTalkCompletion(talk.id);
    return resultUrl;
  }
}

