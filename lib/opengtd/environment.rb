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
      db_config = YAML::load( File.open('config/database.yml') )[ENV['RACK_ENV']]
      ActiveRecord::Base.establish_connection(db_config)
      Thread.new { 
        loop {
          sleep(60*30);
          ActiveRecord::Base.verify_active_connections!
        }
      }.priority = -10
    end
  end
end