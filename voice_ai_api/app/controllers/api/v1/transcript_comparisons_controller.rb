module Api
  module V1
    class TranscriptComparisonsController < BaseController
      def index
        # Get all comparisons for current user's sessions
        @comparisons = TranscriptComparison
          .joins(avatar_session: :user)
          .where(avatar_sessions: { user_id: current_user.id })
          .order(created_at: :desc)
        
        render json: @comparisons, include: [:avatar_session, :recording]
      end
      
      def show
        @comparison = TranscriptComparison.find(params[:id])
        
        # Check authorization
        unless @comparison.avatar_session.user_id == current_user.id
          render json: { error: 'Unauthorized' }, status: :forbidden
          return
        end
        
        render json: @comparison, include: [:avatar_session, :recording]
      end
    end
  end
end
