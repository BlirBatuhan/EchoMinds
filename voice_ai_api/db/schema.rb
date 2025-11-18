# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_18_140043) do
  create_table "avatar_sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "practice_text_id", null: false
    t.integer "status"
    t.string "video_url"
    t.string "d_id_job_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["practice_text_id"], name: "index_avatar_sessions_on_practice_text_id"
    t.index ["user_id"], name: "index_avatar_sessions_on_user_id"
  end

  create_table "practice_texts", force: :cascade do |t|
    t.text "content"
    t.integer "difficulty"
    t.string "language"
    t.text "tags"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active"
  end

  create_table "recordings", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "avatar_session_id", null: false
    t.string "storage_url"
    t.integer "duration_ms"
    t.text "waveform"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["avatar_session_id"], name: "index_recordings_on_avatar_session_id"
    t.index ["user_id"], name: "index_recordings_on_user_id"
  end

  create_table "transcript_comparisons", force: :cascade do |t|
    t.integer "avatar_session_id", null: false
    t.integer "recording_id", null: false
    t.text "reference_text"
    t.text "transcript_text"
    t.integer "similarity_score"
    t.text "mismatched_words"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["avatar_session_id"], name: "index_transcript_comparisons_on_avatar_session_id"
    t.index ["recording_id"], name: "index_transcript_comparisons_on_recording_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.integer "role"
    t.string "api_token_digest"
    t.integer "credits_remaining"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "avatar_sessions", "practice_texts"
  add_foreign_key "avatar_sessions", "users"
  add_foreign_key "recordings", "avatar_sessions"
  add_foreign_key "recordings", "users"
  add_foreign_key "transcript_comparisons", "avatar_sessions"
  add_foreign_key "transcript_comparisons", "recordings"
end
