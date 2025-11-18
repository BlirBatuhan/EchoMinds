class TranscriptComparison < ApplicationRecord
  # Associations
  belongs_to :avatar_session
  belongs_to :recording
  
  # Validations
  validates :reference_text, presence: true
  validates :transcript_text, presence: true
  validates :similarity_score, numericality: { 
    greater_than_or_equal_to: 0, 
    less_than_or_equal_to: 100 
  }, allow_nil: true
  
  # Serialization
  serialize :mismatched_words, coder: JSON
  
  # Callbacks
  before_save :calculate_similarity, if: -> { reference_text_changed? || transcript_text_changed? }
  
  private
  
  def calculate_similarity
    return if reference_text.blank? || transcript_text.blank?
    
    # Simple word-based similarity (same as mobile app)
    ref_words = normalize_text(reference_text).split
    trans_words = normalize_text(transcript_text).split
    
    common = ref_words & trans_words
    total = [ref_words.length, trans_words.length].max
    
    self.similarity_score = total > 0 ? ((common.length.to_f / total) * 100).round : 0
    
    # Find mismatched words
    self.mismatched_words = {
      missing: ref_words - trans_words,
      extra: trans_words - ref_words
    }
  end
  
  def normalize_text(text)
    text.downcase.gsub(/[.,!?;:]/, '').strip
  end
end
