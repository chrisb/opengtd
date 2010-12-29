class AddAuthlogicColumnsToUsers < ActiveRecord::Migration
  def self.up  
    # add_column :users, :crypted_password,   :string,  :null => false
    # add_column :users, :password_salt,      :string,  :null => false
    # add_column :users, :persistence_token,  :string,  :null => false
    # add_column :users, :login_count,        :integer, :null => false, :default => 0
    # add_column :users, :last_request_at,    :datetime
    # add_column :users, :last_login_at,      :datetime
    # add_column :users, :current_login_at,   :datetime
    # add_column :users, :last_login_ip,      :string
    # add_column :users, :current_login_ip,   :string
    
    add_index :users, :email
    # add_index :users, :persistence_token
    # add_index :users, :last_request_at
  end

  def self.down
  end
  
end
