module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!
      
      private
      
      def authenticate_user!
        token = request.headers['Authorization']&.split(' ')&.last
        @current_user = User.find_by(api_token_digest: token)
        
        unless @current_user
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end
      
      def current_user
        @current_user
      end
    end
  end
end

