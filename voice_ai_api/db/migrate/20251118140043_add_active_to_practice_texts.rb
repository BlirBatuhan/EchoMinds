class AddActiveToPracticeTexts < ActiveRecord::Migration[8.0]
  def change
    add_column :practice_texts, :active, :boolean
  end
end
