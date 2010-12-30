class Task < ActiveRecord::Base
  belongs_to :user
  
  validates_presence_of :title
  validates_presence_of :user_id
  
  def complete!
    self.completed = true
    self.completed_at = Time.now
    self.tags = self.tags_array << 'completed'
    save
  end
  
  def add_tag!(tag)
    self.tags = tags_array.push(tag)
    save
  end
  
  def remove_tag!(tag)
    arr = self.tags_array
    arr.delete(tag)
    self.tags = arr
    save
  end
  
  def tags_array
    self.tags.split(',').map { |t| t.strip }
  end
  
  def tags=(tags)
    tags.is_a?(Array) ? super(tags.join(',')) : super(tags)
  end
  
end


# create_table :users do |t|
#   t.string :name
#   t.string :email
#   t.timestamps
# end
# 
# create_table :tasks do |t|
#   t.integer :user_id, :null => false
#   t.boolean :completed, :default => false
#   t.string :title, :null => false
#   t.string :tags
#   t.text :notes
#   t.date :due_on
#   t.timestamps
# end