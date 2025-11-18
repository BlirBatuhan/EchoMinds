class Recording < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :avatar_session, optional: true
  has_one :transcript_comparison, dependent: :destroy
  
  # Validations
  validates :storage_url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :duration_ms, numericality: { greater_than: 0 }, allow_nil: true
  
  # Serialization
  serialize :waveform, coder: JSON
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :for_session, ->(session_id) { where(avatar_session_id: session_id) }
end
