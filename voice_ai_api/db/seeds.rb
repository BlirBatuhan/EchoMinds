# Seed data for VoiceAI API

puts "🌱 Seeding database..."

# Create admin and test users
admin = User.create!(
  email: "admin@voiceai.com",
  role: :admin,
  credits_remaining: 1000
)

student = User.create!(
  email: "student@example.com",
  role: :student,
  credits_remaining: 300
)

puts "✅ Created #{User.count} users"

# Create practice texts (from mobile app)
practice_texts_data = [
  { content: "Hello, how are you today?", difficulty: :beginner, language: "en" },
  { content: "The weather is beautiful today.", difficulty: :beginner, language: "en" },
  { content: "I love learning new languages.", difficulty: :beginner, language: "en" },
  { content: "What is your favorite color?", difficulty: :beginner, language: "en" },
  { content: "Let's practice English together.", difficulty: :beginner, language: "en" },
  { content: "This is a great day for learning.", difficulty: :intermediate, language: "en" },
  { content: "Can you repeat after me?", difficulty: :beginner, language: "en" },
  { content: "I enjoy reading books very much.", difficulty: :intermediate, language: "en" },
  { content: "The sun is shining brightly.", difficulty: :beginner, language: "en" },
  { content: "Learning is fun and exciting.", difficulty: :intermediate, language: "en" },
  { content: "How was your weekend?", difficulty: :beginner, language: "en" },
  { content: "I like to play soccer.", difficulty: :beginner, language: "en" },
  { content: "What do you do for fun?", difficulty: :intermediate, language: "en" },
  { content: "The cat sat on the mat.", difficulty: :beginner, language: "en" },
  { content: "She sells sea shells by the sea shore.", difficulty: :advanced, language: "en" }
]

practice_texts_data.each do |data|
  PracticeText.create!(data)
end

puts "✅ Created #{PracticeText.count} practice texts"

# Create sample avatar session
sample_text = PracticeText.first
session = AvatarSession.create!(
  user: student,
  practice_text: sample_text,
  status: :pending
)

puts "✅ Created #{AvatarSession.count} avatar session"

puts "🎉 Seeding completed!"
puts ""
puts "📊 Database Summary:"
puts "   Users: #{User.count}"
puts "   Practice Texts: #{PracticeText.count}"
puts "   Avatar Sessions: #{AvatarSession.count}"
puts ""
puts "🔑 Test Credentials:"
puts "   Admin: #{admin.email} (API Token: #{admin.api_token_digest})"
puts "   Student: #{student.email} (API Token: #{student.api_token_digest})"
