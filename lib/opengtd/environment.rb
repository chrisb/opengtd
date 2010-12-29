module OpenGTD
  class Environment
    def self.boot!
      require 'rubygems'
      require 'active_record'
      require 'logger'
      require 'lib/models/user'
      require 'lib/models/task'
      require 'lib/models/authorization'
      require 'lib/models/session'
      db_config = YAML::load( File.open('config/database.yml') )['development']
      ActiveRecord::Base.establish_connection(db_config)
    end
  end
end