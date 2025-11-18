class CreateRecordings < ActiveRecord::Migration[8.0]
  def change
    create_table :recordings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :avatar_session, null: false, foreign_key: true
      t.string :storage_url
      t.integer :duration_ms
      t.text :waveform

      t.timestamps
    end
  end
end
