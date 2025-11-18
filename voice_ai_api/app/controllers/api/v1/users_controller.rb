module Api
  module V1
    class UsersController < BaseController
      def me
        render json: current_user, methods: [:role]
      end
      
      def show
        @user = User.find(params[:id])
        
        # Only allow viewing own profile or admin can view all
        unless current_user.admin? || @user.id == current_user.id
          render json: { error: 'Unauthorized' }, status: :forbidden
          return
        end
        
        render json: @user, methods: [:role]
      end
    end
  end
end
