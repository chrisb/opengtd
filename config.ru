require 'environment'

if ENV['RACK_ENV'] == 'development'
  log = File.new('log/development.log', 'a')
  STDOUT.reopen(log)
  STDERR.reopen(log)
end

use Rack::Static, :urls => [ '/stylesheets', '/images', '/javascripts' ], :root => 'public'
use Rack::Session::Cookie

auth_config = YAML::load( File.open('config/omniauth.yml') )

use OmniAuth::Builder do
  provider :twitter, auth_config['twitter']['consumer_key'],  auth_config['twitter']['consumer_secret']
  # provider :open_id, OpenID::Store::Filesystem.new('/tmp')
end

run Rack::Cascade.new([
  OpenGTD::Site,
  OpenGTD::API
])

