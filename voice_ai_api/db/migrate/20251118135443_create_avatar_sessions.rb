class CreateAvatarSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :avatar_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :practice_text, null: false, foreign_key: true
      t.integer :status
      t.string :video_url
      t.string :d_id_job_id

      t.timestamps
    end
  end
end
