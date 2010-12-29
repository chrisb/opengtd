class AddUrlToTasks < ActiveRecord::Migration
  def self.up
    add_column :tasks, :url, :string
  end

  def self.down
    remove_column :tasks, :url
  end
end