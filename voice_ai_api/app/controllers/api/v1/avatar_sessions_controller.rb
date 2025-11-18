module Api
  module V1
    class AvatarSessionsController < BaseController
      def index
        @sessions = current_user.avatar_sessions.includes(:practice_text).recent
        render json: @sessions, include: :practice_text
      end
      
      def show
        @session = current_user.avatar_sessions.find(params[:id])
        render json: @session, include: [:practice_text, :transcript_comparison]
      end
      
      def create
        @session = current_user.avatar_sessions.build(avatar_session_params)
        
        if @session.save
          render json: @session, status: :created
        else
          render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        @session = current_user.avatar_sessions.find(params[:id])
        
        if @session.update(avatar_session_params)
          render json: @session
        else
          render json: { errors: @session.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def generate_video
        @session = current_user.avatar_sessions.find(params[:id])
        
        # Start background job for video generation
        GenerateAvatarVideoJob.perform_later(@session.id)
        
        @session.update(status: :processing)
        
        render json: { 
          message: 'Video generation started', 
          session: @session 
        }
      end
      
      private
      
      def avatar_session_params
        params.require(:avatar_session).permit(:practice_text_id, :status)
      end
    end
  end
end
