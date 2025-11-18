module Api
  module V1
    class RecordingsController < BaseController
      def create
        @recording = current_user.recordings.build(recording_params)
        
        if @recording.save
          render json: @recording, status: :created
        else
          render json: { errors: @recording.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def show
        @recording = current_user.recordings.find(params[:id])
        render json: @recording, include: :transcript_comparison
      end
      
      def transcribe
        @recording = current_user.recordings.find(params[:id])
        
        # Start background job for transcription
        TranscribeAudioJob.perform_later(@recording.id)
        
        render json: { 
          message: 'Transcription started', 
          recording: @recording 
        }
      end
      
      private
      
      def recording_params
        params.require(:recording).permit(:storage_url, :duration_ms, :avatar_session_id, :waveform)
      end
    end
  end
end
