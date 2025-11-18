module Api
  module V1
    class PracticeTextsController < BaseController
      skip_before_action :authenticate_user!, only: [:index, :show, :random]
      
      def index
        @practice_texts = PracticeText.active.order(created_at: :desc)
        
        # Filter by language
        @practice_texts = @practice_texts.by_language(params[:language]) if params[:language].present?
        
        # Filter by difficulty
        @practice_texts = @practice_texts.by_difficulty(params[:difficulty]) if params[:difficulty].present?
        
        render json: @practice_texts
      end
      
      def show
        @practice_text = PracticeText.find(params[:id])
        render json: @practice_text
      end
      
      def random
        language = params[:language] || 'en'
        difficulty = params[:difficulty]
        
        query = PracticeText.active.by_language(language)
        query = query.by_difficulty(difficulty) if difficulty.present?
        
        @practice_text = query.order("RANDOM()").first
        
        if @practice_text
          render json: @practice_text
        else
          render json: { error: 'No practice texts found' }, status: :not_found
        end
      end
      
      def create
        @practice_text = PracticeText.new(practice_text_params)
        
        if @practice_text.save
          render json: @practice_text, status: :created
        else
          render json: { errors: @practice_text.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        @practice_text = PracticeText.find(params[:id])
        
        if @practice_text.update(practice_text_params)
          render json: @practice_text
        else
          render json: { errors: @practice_text.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def destroy
        @practice_text = PracticeText.find(params[:id])
        @practice_text.destroy
        head :no_content
      end
      
      private
      
      def practice_text_params
        params.require(:practice_text).permit(:content, :difficulty, :language, :active, tags: [])
      end
    end
  end
end
