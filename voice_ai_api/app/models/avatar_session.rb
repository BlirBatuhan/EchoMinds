class AvatarSession < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :practice_text
  has_many :recordings, dependent: :destroy
  has_one :transcript_comparison, dependent: :destroy
  
  # Enums
  enum :status, { pending: 0, processing: 1, completed: 2, failed: 3 }
  
  # Validations
  validates :status, presence: true
  validates :video_url, format: { with: URI::DEFAULT_PARSER.make_regexp }, allow_blank: true
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(stat) { where(status: stat) }
  
  # Callbacks
  after_create :set_pending_status
  
  private
  
  def set_pending_status
    update_column(:status, :pending) if status.nil?
  end
end
