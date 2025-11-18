class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email
      t.integer :role
      t.string :api_token_digest
      t.integer :credits_remaining

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
