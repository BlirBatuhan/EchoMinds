Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # API namespace
  namespace :api do
    namespace :v1 do
      # Practice texts
      resources :practice_texts, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get :random
        end
      end
      
      # Avatar sessions
      resources :avatar_sessions, only: [:index, :show, :create, :update] do
        member do
          post :generate_video
        end
      end
      
      # Recordings
      resources :recordings, only: [:create, :show] do
        member do
          post :transcribe
        end
      end
      
      # Transcript comparisons
      resources :transcript_comparisons, only: [:show, :index]
      
      # User info
      get 'me', to: 'users#me'
      get 'users/:id', to: 'users#show'
    end
  end
end
