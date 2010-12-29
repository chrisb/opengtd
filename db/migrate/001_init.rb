class Init < ActiveRecord::Migration
  
  def self.up

    create_table :users do |t|
      t.string :name
      t.string :email
      t.timestamps
    end

    create_table :tasks do |t|
      t.integer :user_id, :null => false
      t.boolean :completed, :default => false
      t.string :title, :null => false
      t.string :tags
      t.text :notes
      t.date :due_on
      t.timestamps
    end
    
  end

  def self.down
  end
end