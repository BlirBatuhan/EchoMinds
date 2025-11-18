class CreatePracticeTexts < ActiveRecord::Migration[8.0]
  def change
    create_table :practice_texts do |t|
      t.text :content
      t.integer :difficulty
      t.string :language
      t.text :tags

      t.timestamps
    end
  end
end
