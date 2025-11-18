class User < ApplicationRecord
  # Associations
  has_many :avatar_sessions, dependent: :destroy
  has_many :recordings, dependent: :destroy
  
  # Enums
  enum :role, { student: 0, admin: 1 }
  
  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :credits_remaining, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  
  # Callbacks
  before_create :set_default_credits
  before_create :generate_api_token
  
  private
  
  def set_default_credits
    self.credits_remaining ||= 300 # 5 saat AssemblyAI = 300 dakika
  end
  
  def generate_api_token
    self.api_token_digest = SecureRandom.hex(32)
  end
end
