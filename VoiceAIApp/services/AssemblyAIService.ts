
export interface AssemblyAIConfig {
  apiKey: string;
}

/**
 * AssemblyAI STT servisi
 * Ücretsiz tier ile aylık 5 saat transkripsiyon
 */
export class AssemblyAIService {
  private apiKey: string;
  private baseUrl = 'https://api.assemblyai.com/v2';

  constructor(config: AssemblyAIConfig) {
    this.apiKey = config.apiKey;
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log('Starting AssemblyAI transcription...');
      console.log('Audio URI:', audioUri);

      // React Native FormData supports URI directly
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      console.log('Uploading audio to AssemblyAI...');

      // Upload audio first
      const uploadResponse = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('AssemblyAI upload error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      const uploadUrl = uploadResult.upload_url;
      console.log('Audio uploaded, URL:', uploadUrl);

      // Submit for transcription
      const transcribeResponse = await fetch(`${this.baseUrl}/transcript`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: uploadUrl,
          language_code: 'en'
        }),
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        console.error('AssemblyAI transcription error:', errorText);

        if (transcribeResponse.status === 401 || transcribeResponse.status === 403) {
          throw new Error('Invalid AssemblyAI API key or insufficient credits. Please check your API key.');
        }

        throw new Error(`Transcription failed: ${transcribeResponse.status} - ${errorText}`);
      }

      const transcribeResult = await transcribeResponse.json();
      const transcriptId = transcribeResult.id;
      console.log('Transcription submitted, ID:', transcriptId);

      // Poll for completion
      let transcript = transcribeResult;
      while (transcript.status === 'queued' || transcript.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await fetch(`${this.baseUrl}/transcript/${transcriptId}`, {
          headers: {
            'authorization': this.apiKey
          }
        });
        transcript = await statusResponse.json();
        console.log('Transcription status:', transcript.status);
      }

      if (transcript.status === 'error') {
        throw new Error('Transcription failed: ' + transcript.error);
      }

      // Extract text
      const text = transcript.text || '';

      if (!text || text.trim() === '') {
        throw new Error('Empty transcript received from AssemblyAI');
      }

      console.log('Transcription complete:', text);
      return text;
    } catch (error) {
      console.error('Error in AssemblyAI transcription:', error);
      throw error;
    }
  }
}

