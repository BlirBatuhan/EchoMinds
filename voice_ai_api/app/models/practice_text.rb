class PracticeText < ApplicationRecord
  # Associations
  has_many :avatar_sessions, dependent: :destroy
  
  # Enums
  enum :difficulty, { beginner: 0, intermediate: 1, advanced: 2 }
  
  # Validations
  validates :content, presence: true, length: { minimum: 5, maximum: 500 }
  validates :difficulty, presence: true
  validates :language, presence: true, inclusion: { in: %w[en tr es fr de] }
  
  # Scopes
  scope :by_language, ->(lang) { where(language: lang) }
  scope :by_difficulty, ->(diff) { where(difficulty: diff) }
  scope :active, -> { where(active: true) }
  
  # Serialization
  serialize :tags, coder: JSON
  
  # Callbacks
  before_create :set_active
  
  private
  
  def set_active
    self.active = true if active.nil?
  end
end
