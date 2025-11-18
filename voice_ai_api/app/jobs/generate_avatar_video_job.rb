class GenerateAvatarVideoJob < ApplicationJob
  queue_as :default
  
  def perform(avatar_session_id)
    session = AvatarSession.find(avatar_session_id)
    
    # Get API keys from credentials or ENV
    d_id_api_key = Rails.application.credentials.dig(:d_id, :api_key) || ENV['D_ID_API_KEY']
    eleven_labs_api_key = Rails.application.credentials.dig(:eleven_labs, :api_key) || ENV['ELEVEN_LABS_API_KEY']
    
    # Initialize D-ID service
    service = DIdService.new(
      api_key: d_id_api_key,
      eleven_labs_api_key: eleven_labs_api_key
    )
    
    begin
      # Update status
      session.update!(status: :processing)
      
      # Generate video
      text = session.practice_text.content
      video_url = service.text_to_speech(text: text)
      
      # Save result
      session.update!(
        status: :completed,
        video_url: video_url
      )
      
      Rails.logger.info "Avatar video generated successfully for session #{session.id}"
    rescue => e
      session.update!(status: :failed)
      Rails.logger.error "Failed to generate avatar video: #{e.message}"
      raise e
    end
  end
end
