class TranscribeAudioJob < ApplicationJob
  queue_as :default
  
  def perform(recording_id)
    recording = Recording.find(recording_id)
    
    # Get API key from credentials or ENV
    assembly_ai_api_key = Rails.application.credentials.dig(:assembly_ai, :api_key) || ENV['ASSEMBLY_AI_API_KEY']
    
    # Initialize AssemblyAI service
    service = AssemblyAIService.new(api_key: assembly_ai_api_key)
    
    begin
      # Transcribe audio
      transcript_text = service.transcribe_audio(
        audio_url: recording.storage_url,
        language: 'en'
      )
      
      # Get reference text from avatar session if exists
      if recording.avatar_session.present?
        reference_text = recording.avatar_session.practice_text.content
        
        # Create transcript comparison
        comparison = TranscriptComparison.create!(
          avatar_session: recording.avatar_session,
          recording: recording,
          reference_text: reference_text,
          transcript_text: transcript_text
        )
        
        # Update user credits
        duration_minutes = (recording.duration_ms || 0) / 60000.0
        user = recording.user
        user.update!(credits_remaining: user.credits_remaining - duration_minutes.ceil) if user.credits_remaining
        
        Rails.logger.info "Transcription completed for recording #{recording.id}. Similarity: #{comparison.similarity_score}%"
      else
        Rails.logger.info "Transcription completed for recording #{recording.id}: #{transcript_text}"
      end
    rescue => e
      Rails.logger.error "Failed to transcribe audio: #{e.message}"
      raise e
    end
  end
end
