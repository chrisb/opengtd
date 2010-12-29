class AddMetaToTasks < ActiveRecord::Migration
  
  def self.up
    add_column :tasks, :meta, :text
  end

  def self.down
    remove_column :tasks, :meta
  end
end