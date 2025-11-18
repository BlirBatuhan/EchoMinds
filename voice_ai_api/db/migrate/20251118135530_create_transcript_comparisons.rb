class CreateTranscriptComparisons < ActiveRecord::Migration[8.0]
  def change
    create_table :transcript_comparisons do |t|
      t.references :avatar_session, null: false, foreign_key: true
      t.references :recording, null: false, foreign_key: true
      t.text :reference_text
      t.text :transcript_text
      t.integer :similarity_score
      t.text :mismatched_words

      t.timestamps
    end
  end
end
